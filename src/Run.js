const yaml2fhir = require('./yaml2fhir/yaml2fhir');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const yamlContent = `---

resourceType: Bundle
type: collection
entry:
-  
  fullUrl: 'dfgdf'
  resource:
    resourceType: Patient
    name: Joe Smith
    gender: male
    birthDate: 2003-02-16
-
  fullUrl: 'dfgfd'
  resource:
    resourceType: MedicationRequest
    code: RXNORM#197591 Diazepam 5 MG Oral Tablet
    authoredOn: 2018-12-05
-
  fullUrl: ''
  resource:
    resourceType: MedicationRequest
    code: RXNORM#1001437 caffeine 50 MG / magnesium salicylate 162.5 MG Oral Tablet
    authoredOn: 2018-12-05
`;
let yamlObject = yaml.load(yamlContent);
if (yamlObject.resourceType == null) {

  for (const data of yamlObject.data) {
    try {
      const result = yaml2fhir(data, null, 'r4');
      console.log(JSON.stringify(result, null, 2));
      console.log('\n');
      // fs.writeFileSync(`${outputFolder}/${result.id}.json`, JSON.stringify(result, null, 2));

    } catch (e) {
      console.log(e);
    }
  }

  //const result = yaml2fhir(yamlObject.data[0], null, 'r4');
  //console.log(result);
} else if (yamlObject.resourceType == 'Bundle') {

  // const result2 = yaml2fhir(yamlObject, null, 'r4');

  let bundle = {
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

  console.log(JSON.stringify(bundle, null, 2));

} else {
  const result = yaml2fhir(yamlObject, null, 'r4');
  console.log(result);
}
