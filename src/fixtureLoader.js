const fs = require('fs');
const path = require('path');
const yaml2fhir = require('./yaml2fhir/yaml2fhir');
const yaml = require('js-yaml');

/**
 * Recursively load a directory of JSON files
 *
 * @param {string} pathToDir absolute path from the caller of where directory is located
 * @returns {Array} array of JSON parsed fixtures
 */
function loadJSONFromDirectory(pathToDir) {
  const filesInDir = fs.readdirSync(pathToDir)
    .filter((f) => path.extname(f) === '.json');
  const directories = fs.readdirSync(pathToDir)
    .filter((f) => fs.lstatSync(path.join(pathToDir, f))
      .isDirectory());

  const directoryContents = directories.map((f) => loadJSONFromDirectory(path.join(pathToDir, f)));

  const selfContents = filesInDir.map((f) => JSON.parse(fs.readFileSync(path.join(pathToDir, f), 'utf8')));

  return [...directoryContents, ...selfContents].flat();
}

/**
 * Recursively load a directory of JSON files
 *
 * @param {string} pathToDir absolute path from the caller of where directory is located
 * @returns {Array} array of JSON parsed fixtures
 */
function loadYAMLFromDirectory(pathToDir) {
  const filesInDir = fs.readdirSync(pathToDir)
    .filter((f) => path.extname(f) === '.yaml');
  const directories = fs.readdirSync(pathToDir)
    .filter((f) => fs.lstatSync(path.join(pathToDir, f))
      .isDirectory());

  const directoryContents = directories.map((f) => loadYAMLFromDirectory(path.join(pathToDir, f)));

  const selfContents = filesInDir.map((f) => {

    const yamlContent = fs.readFileSync(path.join(pathToDir, f));
    const yamlObject = yaml.load(yamlContent);
    let bundle = {
      id: yamlObject.id,
      resourceType: 'Bundle',
      entry: [],
    };
    for (const entry of yamlObject.entry) {
      if (entry.resource != null) {
        const result = yaml2fhir(entry.resource, null, 'r4');
        bundle.entry.push({
          fullUrl: entry.fullUrl,
          resource: result,
        });
      }
    }
    return bundle;

  }, 'utf8');

  return [...directoryContents, ...selfContents].flat();
}

/**
 * Load any JSON fixture
 *
 * @param {string} pathToFixture absolute path from the caller of where fixture is located
 * @returns {Object} JSON parsed fixture
 */
function loadJSONFixture(pathToFixture) {
  const f = fs.readFileSync(pathToFixture, 'utf8');
  return JSON.parse(f);
}

/**
 * Default loader for Elm
 *
 * @returns {Array} array of JSON parsed Elm
 */
function defaultLoadElm() {
  // Ensure that env variables are defined
  if (!process.env.OUTPUT_ELM) {
    throw Error('Unable to find env value for OUTPUT_ELM; make sure you set this in your .env file');
  }
  const elmPath = path.resolve(process.cwd(), process.env.OUTPUT_ELM);

  const libraries = {};
  loadJSONFromDirectory(elmPath)
    .forEach((l) => libraries[l.library.identifier.id] = l);
  return libraries;
}

/**
 * Default loader for Patients
 *
 * @returns {Array} array of JSON parsed Patients
 */
function defaultLoadPatients() {
  // Ensure that env variables are defined
  if (!process.env.PATIENTS) {
    throw Error('Unable to find env value for PATIENTS; make sure you set this in your .env file');
  }
  const patientsPath = path.resolve(process.cwd(), process.env.PATIENTS);
  let patients = loadJSONFromDirectory(patientsPath);

  let patients2 = loadYAMLFromDirectory(patientsPath);
  patients.push(patients2);
  return patients;
}

/**
 * Default loader for Valuesets
 *
 * @returns {Array} array of JSON parsed Valuesets
 */
function defaultLoadValuesets() {
  // Ensure that env variables are defined
  if (!process.env.VALUESETS) {
    throw Error('Unable to find env value for VALUESETS; make sure you set this in your .env file');
  }
  const valuesetsPath = path.resolve(process.cwd(), process.env.VALUESETS);
  return loadJSONFromDirectory(valuesetsPath);
}

module.exports = {
  loadJSONFixture,
  loadJSONFromDirectory,
  defaultLoadElm,
  defaultLoadPatients,
  defaultLoadValuesets,
};
