# Guide: Adding and Testing New CQL Files in `cdss-testing-harness`

This guide walks you through how to add new CQL rules and write tests for them using the existing structure of the
`cdss-testing-harness` project.

---

## Directory Structure Overview

Your project is organized into:

* `test/fixtures/cql`: Raw `.cql` source files
* `test/fixtures/elm`: Corresponding compiled `.json` ELM files
* `test/fixtures/patients`: Patient test data (JSON FHIR bundles)
* `test/MMR_Positive.test.js`: Positive test cases validating expected recommendations
* `test/MMR_Negative.test.js`: Negative test cases validating expected recommendations *(Not fully completed)*

---

## Step-by-Step: Adding a New CQL Rule

### 1. **Create a Directory for the Rule**

Each rule has its own folder inside the `cql`, `elm`, and `patients` directories.

Create a new folder inside:

```
test/fixtures/cql/YourRuleName
test/fixtures/elm/YourRuleName
test/fixtures/patients/YourRuleName
```

Example:

```bash
mkdir test/fixtures/cql/MMR13ExampleNewRule
mkdir test/fixtures/elm/MMR13ExampleNewRule
mkdir test/fixtures/patients/MMR13ExampleNewRule
```

---

### 2. **Write the CQL File**

Create your `.cql` file inside the `cql/YourRuleName` directory. Example:

```cql
// test/fixtures/cql/MMR13ExampleNewRule/MMR_Rule13.cql

library MMR_Rule13 version '1.0.0'

using FHIR version '4.0.1'

include FHIRHelpers version '4.0.1'
include MMR_Common_Library version '1.0.0' called Common

context Patient

define "VaccineName":
  'Measles, Mumps, and Rubella Virus Vaccine'

define "Recommendations":
  if AgeInMonths() < 12 then
    { recommendation: 'Schedule 1st dose when patient is 12-15 months' }
  else
    { recommendation: 'No recommendation' }

define function "AgeInMonths"():
  months between Patient.birthDate and Today()
```

---

### 3. **Compile the CQL to ELM**

Use the script:

```bash
npm run translate-cql
```

It will compile `.cql` files from `test/fixtures/cql/**` and place the `.json` output into `test/fixtures/elm/**`.

Make sure:

* The ELM file matches the CQL file name
* It's placed in the correct subfolder

---

### 4. **Add Patient Test Data**

Inside `test/fixtures/patients/YourRuleName`, add one or more FHIR `Bundle` files named like:

* `MMR_Rule13_Positive.json`
* `MMR_Rule13_Negative.json`

Each bundle should have a `Patient` resource with an `id` field and optionally related data (e.g. `Immunization`).

---

### 5. **Write the Test Case**

Edit `test/MMR_Positive.test.js` or create a new file like `MMR_YourRuleName.test.js`.

Each test should follow this structure:

```js
describe('MMR Rule 13:\n\tExpected behavior...', () => {
  test('Validates recommendation', async () => {
    const rule = elms.MMR13ExampleNewRule; // Must match the ELM library name

    const patient = patientBundles.MMR13ExampleNewRule.entry[0].resource;

    const codeService = new vsac.CodeService(VALUESETS_CACHE, true, true);
    const result = await executeCql(patient, rule, libraries, { 'Imm': [] }, codeService, API_KEY);
    const patientResult = result[patient.id];

    expect(patientResult.VaccineName)
      .toEqual('Measles, Mumps, and Rubella Virus Vaccine');
    expect(patientResult.Recommendations)
      .toHaveLength(1);
    expect(patientResult.Recommendations[0].recommendation)
      .toContain('Schedule 1st dose');
  });
});
```

Make sure the rule name and patientBundle ID match your directory and file names.

---

### 6. **Run the Tests**

To run all tests:

```bash
npm run test-cql
```

Or directly run with Jest:

```bash
npx jest test/MMR_Positive.test.js
```

---

## Naming & Conventions Checklist

| Item                | Format / Convention                              |
|---------------------|--------------------------------------------------|
| Rule folder name    | `MMR13ExampleNewRule`                            |
| CQL filename        | `MMR_Rule13.cql`                                 |
| ELM filename        | `MMR_Rule13.json`                                |
| Patient bundle name | `MMR_Rule13_Positive.json`                       |
| Test function name  | `elms.MMR13ExampleNewRule`                       |
| Patient reference   | `patientBundles.MMR13ExampleNewRule`             |
| Library ref         | `libraries.MMR_Common_Library` and `FHIRHelpers` |

---

## Notes

* The `executeCql` function uses a `CodeService` from `cql-exec-vsac` to load value sets. Ensure the `.env` file is
  correctly configured with your VSAC API key and value set cache path.
* The `now` date in the tests can be adjusted to test time-sensitive rules.
* Common logic used by multiple rules should go in `MMR_Common_Library.cql`.
