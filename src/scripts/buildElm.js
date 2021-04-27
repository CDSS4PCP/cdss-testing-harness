#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('cql-translation-service-client');

dotenv.config();

// Ensure that env variables are defined
if (!(process.env.INPUT_CQL && process.env.OUTPUT_ELM)) {
  throw Error(`Unable to find ENV values for INPUT_CQL or OUTPUT_ELM in ${path.join(process.cwd(), '.env')}`);
}

const cqlPathString = path.resolve(process.cwd(), process.env.INPUT_CQL);
const buildPathString = path.resolve(process.cwd(), process.env.OUTPUT_ELM);

const TRANSLATION_SERVICE_URL = !process.env.TRANSLATION_SERVICE_URL
  ? 'http://localhost:8080/cql/translator'
  : process.env.TRANSLATION_SERVICE_URL;
const client = new Client(TRANSLATION_SERVICE_URL);

/**
 * Recursively gets all paths to CQL files in a given directory
 *
 * @param {String} cqlPath path to folder containing cql files
 * or subdirectories containing cql files
 * @returns {Array} Array of paths to cql files
 */
function getCQLFiles(cqlPath) {
  // get all CQL files in cirrent directory
  const files = fs
    .readdirSync(cqlPath)
    .filter((f) => path.extname(f) === '.cql')
    .map((f) => path.join(cqlPath, f));
  // get all directories in the currect directory
  const subDirs = fs
    .readdirSync(cqlPath)
    .filter((f) => fs.lstatSync(path.join(cqlPath, f)).isDirectory() && f !== 'node_modules')
    .map((dir) => path.join(cqlPath, dir));
  // recursively check each subdirectory for cql files and add them to the output array
  subDirs.forEach((dir) => {
    files.push(...getCQLFiles(dir));
  });
  return files;
}

/**
 * Translate all cql
 *
 * @returns {Object} ELM from translator, or {} if nothing to translate
 */
async function translateCQL() {
  const cqlPaths = cqlPathString.split(',');
  const cqlFiles = cqlPaths
    .map((p) => path.resolve(p))
    .map((cqlPath) => getCQLFiles(cqlPath))
    .flat();
  const cqlRequestBody = {};
  let includeCQL = false;
  cqlFiles.forEach((cqlFilePath) => {
    // Check if ELM already exists to see if translation is needed
    const correspondingElm = fs
      .readdirSync(buildPathString)
      .find((elmFile) => path.basename(elmFile, '.json') === path.basename(cqlFilePath, '.cql'));

    // If ELM exists in build, compare timestamps
    if (correspondingElm) {
      const cqlStat = fs.statSync(cqlFilePath);
      const elmStat = fs.statSync(path.join(buildPathString, correspondingElm));

      // cql file was modified more recently
      if (cqlStat.mtimeMs > elmStat.mtimeMs) {
        includeCQL = true;
      }
    } else {
      // No ELM file so need to convert
      includeCQL = true;
    }

    cqlRequestBody[path.basename(cqlFilePath, '.cql')] = {
      cql: fs.readFileSync(cqlFilePath, 'utf8'),
    };
  });

  if (includeCQL && Object.keys(cqlRequestBody).length > 0) {
    const resp = await client.convertCQL(cqlRequestBody);
    if (resp.isAxiosError) {
      throw resp;
    }
    // Else we have our resulting elm
    return resp;
  }

  if (!includeCQL) {
    console.log(`No CQL changes detected: skipping translation for CQL files in ${cqlPaths.join(', ')}`);
  }
  return {};
}

/**
 * Find any errors found in the ELM annotation
 *
 * @param {Object} elm ELM JSON to look for errors in
 * @returns {Array} annotations with severity error
 */
function processErrors(elm) {
  const errors = [];

  // Check annotations for errors. If no annotations, no errors
  if (elm.library.annotation) {
    elm.library.annotation.forEach((a) => {
      if (a.errorSeverity === 'error') {
        errors.push(a);
      }
    });
  }

  return errors;
}

translateCQL()
  .then((libraries) => {
    Object.entries(libraries).forEach(([libName, elm]) => {
      const errors = processErrors(elm);
      if (errors.length === 0) {
        const elmPath = path.join(buildPathString, `${libName}.json`);
        fs.writeFileSync(elmPath, JSON.stringify(elm), 'utf8');
        console.log(`Wrote ELM to ${elmPath}`);
      } else {
        console.error('Error translating to ELM');
        console.error(errors);
        process.exit(1);
      }
    });
  })
  .catch((e) => {
    console.error(`HTTP error translating CQL: ${e.message}`);
    console.error(e.stack);
    process.exit(1);
  });
