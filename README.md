# cql-testing-harness

A utility for translating, executing, and testing CQL libraries.

![cql-testing-harness](https://user-images.githubusercontent.com/16297930/114772263-9a29e400-9d3b-11eb-9795-90a54af89f80.png)

## Prerequisites

* [Docker](https://docker.com)
* [Node.js](https://nodejs.org/en/)

Users also need to configure a `.env` file in your CQL repository, defining the following values:

```
TRANSLATION_SERVICE_URL='http://localhost:8080/cql/translator'  # An endpoint exposing a CQL translation service
INPUT_CQL='./cql'                                               # Folder(s) containing all CQL to translate
VALUESETS='./valuesets'                                         # Folder where CQL-dependent valuesets live
OUTPUT_ELM='./output-elm'                                       # Folder where translated ELM will be saved
PATIENTS='./test/fixtures/patients'                             # Folder storing patient files used as test fixtures
```

The `INPUT_CQL` value can take multiple directories, separated by a comma, in order to tell the testing harness to look in more than one directory for CQL files.

```
INPUT_CQL='cqlDir1,cqlDir2,cqlDir3'
...
```

## Usage

Install the testing harness into your project:

``` bash
npm install --save cql-testing-harness
```

This will allow your project to access the testing scripts, as well as the exported utilities for executing your CQL.

### Scripts

#### test-cql

``` bash
test-cql [-n] [-t path/to/test/directory]
```

* `-n`: When this option is included, the script will not start a new cql-translation-service docker container. When using this option, ensure you have an instance of the translation service running on your machine at the URL specified in .env
* `-t`: This option allows you to specify a specific directory or pattern that `jest` should use to run the tests. If omitted, the script will use `jest`'s default which is any file that ends in `.test.js`

This script will do the following:

1. Start a [cql-translation-service](https://github.com/cqframework/cql-translation-service) docker container
2. Translate all CQL in the`INPUT_CQL` directory into ELM JSON and write it to `OUTPUT_ELM`. This will only occur if CQL files in the `INPUT_CQL` have changed and the ELM needs to be updated
3. Run the unit tests present in the specified test directory

#### translate-cql

``` bash
translate-cql
```

This script will only do step 2. from above: translate all CQL in the`INPUT_CQL` directory into ELM JSON and write it to `OUTPUT_ELM`. This will only occur if CQL files in the `INPUT_CQL` have changed and the ELM needs to be updated

### Utilities

#### Fixture Loading

`loadJSONFromDirectory(pathToDir)`: loads all JSON files in `pathToDir` and returns the contents as an array

* `pathToDir` (`string`): absolute path to the directory containing the JSON files

`loadJSONFixture(pathToFixture)`: loads the JSON file present at `pathToFixture` and returns the parsed contents

* `pathToFixture` (`string`): absolute path to the JSON file

`defaultLoadElm()`: loads the ELM JSON present at the `OUTPUT_ELM` value specified in `.env`

`defaultLoadPatients()`: loads all of the patient bundle JSONs present at the `PATIENTS` value specified in `.env`

`defaultLoadValuesets()`: loads all of the ValueSet JSON files present at the `VALUESETS` value specified in `.env`

#### CQL Execution Utilities

`mapValueSets(valueSetResources)`: converts the list of FHIR ValueSet JSON content into a [cql-execution CodeService](https://github.com/cqframework/cql-execution/blob/master/src/cql-code-service.js)

* `valueSetResources` (`Array<FHIR ValueSet JSON>`): Array of parsed FHIR ValueSet JSON objects

`execute(elmJSONs, patientBundles, valueSetMap, libraryID)`: executes the provided ELM against the list of patient records and returns execution results. 

* `elmJSONs`: Array of ELM JSON content
* `patientBundles`: Array of parsed patient bundle JSON
* `valueSetMap`: a  [CQL CodeService](https://github.com/cqframework/cql-execution/blob/master/src/cql-code-service.js) object for all of the ValueSets needed in the CQL library (can be obtained using `mapValueSets` from above)
* `libraryID`: The identifier of the "main" ELM library that is the root of your CQL repository

## Full Example

1. Setup `.env` with necessary content

   ```
   # .env contents
   TRANSLATION_SERVICE_URL='http://localhost:8080/cql/translator'  # An endpoint exposing a CQL translation service
   INPUT_CQL='./cql'                                               # Folder(s) containing all CQL to translate
   VALUESETS='./valuesets'                                         # Folder where CQL-dependent valuesets live
   OUTPUT_ELM='./output-elm'                                       # Folder where translated ELM will be saved
   PATIENTS='./test/fixtures/patients'                             # Folder storing patient files used as test fixtures
   ```

2. Install `cql-testing-harness`

   ``` bash
   npm install --save cql-testing-harness
   ```

3. Create a test for your CQL:

   ``` javascript
   /* example.test.js */
   
   const dotenv = require('dotenv');
   const {
     defaultLoadElm,
     defaultLoadPatients,
     defaultLoadValuesets,
     mapValueSets,
     execute,
   } = require('cql-testing-harness');
   
   // Initialize the env variables
   dotenv.config();
   
   let executionResults;
   beforeAll(() => {
     // Set up necessary data for cql-execution
     const valueSets = defaultLoadValuesets();
     const valueSetMap = mapValueSets(valueSets);
     const elm = defaultLoadElm();
     const patientBundles = defaultLoadPatients();
   
     executionResults = execute(elm, patientBundles, valueSetMap, 'ExampleLibrary');
   });
   
   test('Example Tests', () => {
     expect(executionResults).toBeDefined();
   });
   ```

4. Create script(s) for running the tests/doing translation in `package.json`

   ```
   "scripts": {
     "test": "test-cql -t path/to/test/directory",
     "translate": "translate-cql"
     ...
   }
   ...
   ```

5. Run the test script to translate the CQL into ELM and get the execution results to use in unit test assertions:

   ``` bash
   npm run test
   ```

   Example output:

   ```
   > test-cql -t ./test
   > Starting cql-translation-service
   1a792ea3a528d707379e2e0c4d6842e317792167812eeb1b6df86a35c5fc1caf
   > Waiting for server
   ..> Translating CQL
   Wrote ELM to output-elm/example.json
   > Running unit tests
    PASS  test/example.test.js
     ✓ Example Tests (2 ms)
   
   Test Suites: 1 passed, 1 total
   Tests:       1 passed, 1 total
   Snapshots:   0 total
   Time:        2.06 s
   Ran all test suites matching /.\/test/i.
   > Stopping cql-translation-service
   cql-translation-service
   ```

   
