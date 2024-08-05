# cdss-testing-harness

A utility for translating, executing, and testing CQL libraries, specifically for the [CDSS4PCP](https://cdss4pcp.com/)
project

This project is forked from [cql-testing-harness](https://github.com/mcode/cql-testing-harness) and modified for
additional functionality for testing CDS Vaccine rules.


## Prerequisites

* [Docker](https://docker.com)
* [Node.js](https://nodejs.org/en/)

Users also need to configure a `.env` file in your CQL repository, defining the following values:

```
TRANSLATION_SERVICE_URL=http://localhost:8080/cql/translator   # An endpoint exposing a CQL translation service
INPUT_CQL=./test/fixtures/cql                                  # Folder(s) containing all CQL to translate
OUTPUT_ELM=./test/fixtures/elm                                 # Folder where translated ELM will be saved
VALUESETS=./test/fixtures/valuesets                            # Folder where CQL-dependent valuesets live
PATIENTS=./test/fixtures/patients                              # Folder storing patient files used as test fixtures
VSAC_API_KEY=your_key                                          # UMLS API key that will be used to download valuesets. For increased security, store the API key in a env variable instead
```

The `INPUT_CQL` value can take multiple directories, separated by a comma, in order to tell the testing harness to look
in more than one directory for CQL files.

```
INPUT_CQL='cqlDir1,cqlDir2,cqlDir3'
```

## Notable Dependencies

* [cql-exec-vsac](https://www.npmjs.com/package/cql-exec-vsac):  Used for identifying and downloading valuesets within
  CQL rules
* [cdss-common](https://github.com/xjing16/EMR_EHR4CDSSPCP/tree/main/Common/cdss-common):  The common module that is
  used for executing CQL rules in thee [CDSS4PCP](https://cdss4pcp.com/) project

## Usage

### Scripts

#### test-cql

``` bash
test-cql [-n] [-t path/to/test/directory]
```

* `-n`: When this option is included, the script will not start a new cql-translation-service docker container. When
  using this option, ensure you have an instance of the translation service running on your machine at the URL specified
  in .env
* `-t`: This option allows you to specify a specific directory or pattern that `jest` should use to run the tests. If
  omitted, the script will use `jest`'s default which is any file that ends in `.test.js`

This script will do the following:

1. Start a [cql-translation-service](https://github.com/cqframework/cql-translation-service) docker container
2. Translate all CQL in the`INPUT_CQL` directory into ELM JSON and write it to `OUTPUT_ELM`. This will only occur if CQL
   files in the `INPUT_CQL` have changed and the ELM needs to be updated
3. Run the unit tests present in the specified test directory

#### translate-cql

``` bash
translate-cql
```

This script will only do step 2. from above: translate all CQL in the`INPUT_CQL` directory into ELM JSON and write it
to `OUTPUT_ELM`. This will only occur if CQL files in the `INPUT_CQL` have changed and the ELM needs to be updated

### Utilities

#### Fixture Loading

`loadJSONFromDirectory(pathToDir)`: loads all JSON files in `pathToDir` and returns the contents as an array

* `pathToDir` (`string`): absolute path to the directory containing the JSON files

`loadJSONFixture(pathToFixture)`: loads the JSON file present at `pathToFixture` and returns the parsed contents

* `pathToFixture` (`string`): absolute path to the JSON file

`defaultLoadElm()`: loads the ELM JSON present at the `OUTPUT_ELM` value specified in `.env`

`defaultLoadPatients()`: loads all of the patient bundle JSONs present at the `PATIENTS` value specified in `.env`

`defaultLoadValuesets()`: loads all of the ValueSet JSON files present at the `VALUESETS` value specified in `.env`

## Full Example

1. Setup `.env` with necessary content

```
# .env contents
TRANSLATION_SERVICE_URL=http://localhost:8080/cql/translator   # An endpoint exposing a CQL translation service
INPUT_CQL=./test/fixtures/cql                                  # Folder(s) containing all CQL to translate
OUTPUT_ELM=./test/fixtures/elm                                 # Folder where translated ELM will be saved
VALUESETS=./test/fixtures/valuesets                            # Folder where CQL-dependent valuesets live
PATIENTS=./test/fixtures/patients                              # Folder storing patient files used as test fixtures
VSAC_API_KEY=your_key                                          # UMLS API key that will be used to download valuesets. For increased security, store the API key in a env variable instead
```

2. Create a test for your CQL:

``` javascript
/* example.test.js */


const dotenv = require('dotenv');
const vsac = require('cql-exec-vsac');
const {
  executeCql,
} = require('cdss-common/src/cdss-module');
const {
  defaultLoadElm,
  defaultLoadPatients,
} = require('../src');
const {
  getNumberOfMonths,
  getNumberOfWeeks,
} = require('./timeUtil');


// Initialize the env variables
dotenv.config();

const API_KEY = process.env.VSAC_API_KEY;
const VALUESETS_CACHE = process.env.VALUESETS;
let elms;
let patientBundles;


beforeAll(() => {
  // Set up necessary data for cql-execution
  elms = defaultLoadElm();

  // patientBundles = defaultCustomPatients();
  const bundles = defaultLoadPatients();
  patientBundles = {};
  bundles.forEach((bundle) => {
    patientBundles[bundle.id] = bundle;
  });
});

describe('MMR Rule 1 Tests', () => {
  test('VaccineName should be Measles, Mumps, and Rubella Virus Vaccine, Patient birthdate should be < 12 mon, No previous dose, Recommendations should be Schedule 1st dose 12-15 mon of age AND Schedule 2nd dose 4-6 yr of age', async () => {
    const rule = elms.MMR1regularyoungerthan12monthsNoMMRRecommendation;

    const patient = patientBundles.MMR1.entry[0].resource;
    const libraries = {
      FHIRHelpers: elms.FHIRHelpers,
      Common: elms.MMR_Common_Library,
    };
    const codeService = new vsac.CodeService(VALUESETS_CACHE, true, true);
    const result = await executeCql(patient, rule, libraries, { 'Imm': [] }, codeService, API_KEY);
    expect(result)
      .not
      .toBeNull();
    const patientResult = result[patient.id];

    const patientBod = new Date(patient.birthDate);

    expect(patientResult.VaccineName)
      .toEqual('Measles, Mumps, and Rubella Virus Vaccine');
    
    expect(patientResult.Recommendations)
      .toHaveLength(2);
    expect(patientResult.Recommendations[0].recommendation)
      .toEqual(expect.stringContaining('Recommendation 1: Schedule 1st dose MMR when patient is 12-15 months'));

    expect(patientResult.Recommendations[1].recommendation)
      .toEqual(expect.stringContaining('Recommendation 2: Schedule 2nd dose MMR when patient is 4-6 years'));
  });
});
```

4. Run the test script to translate the CQL into ELM and get the execution results to use in unit test assertions:

   ``` bash
   npm run test-cql
   ```

   Example output:

```

> cdss-testing-harness@1.0.0 test-cql
> node ./src/scripts/run.js

> Starting cql-translation-service
26a543ed9ac3fcce8e308c6de1ae008db189be0e7765f50006dfbf2a51f36d29
> Waiting for server
.> Translating CQL
Wrote ELM to C:\Users\C2\Documents\Clemson\Assistantship\cdss-testing-harness\test\fixtures\elm\FHIRHelpers.json
Wrote ELM to C:\Users\C2\Documents\Clemson\Assistantship\cdss-testing-harness\test\fixtures\elm\MMR1\MMR1.json
Wrote ELM to C:\Users\C2\Documents\Clemson\Assistantship\cdss-testing-harness\test\fixtures\elm\MMR_Common_Library.json
> Running unit tests
 PASS  test/execution.test.js
  MMR Rule 1 Tests
    √ VaccineName should be Measles, Mumps, and Rubella Virus Vaccine, Patient birthdate should be < 12 mon, No previous dose, Recommendations should be Schedule 1st dose 12-15 mon of age AND Schedule 2nd dose 4-6 yr of age (134 ms)                                                                                                                                                                                                                                

Test Suites: 1 passed, 1 total                                                                                                                                                                                                      
Tests:       1 passed, 1 total                                                                                                                                                                                                      
Snapshots:   0 total
Time:        2.038 s, estimated 3 s
Ran all test suites.
> Stopping cql-translation-service
cql-translation-service

```

   
