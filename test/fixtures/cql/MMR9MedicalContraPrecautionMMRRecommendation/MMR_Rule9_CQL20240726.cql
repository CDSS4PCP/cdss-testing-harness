library "MMR9MedicalContraPrecautionMMRRecommendation" version '1'

//include "MMR_Common_Library" version '1' called Common

using FHIR version '4.0.1'

include "FHIRHelpers" version '4.0.1' called FHIRHelpers
include "MMR_Common_Library" version '1' called Common

//MMR valuesets and codesystems

codesystem "Other": 'http://hl7.org/fhir/sid/cvx'

valueset "Measles, Mumps and Rubella (MMR) Vaccine Administered VS": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.110.11.1086'
valueset "Measles, Mumps and Rubella (MMR) Vaccine VS": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.196.11.1235'
valueset "Measles, Mumps and Rubella (MMR) Vaccine VS_1": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.196.12.1224'
valueset "Measles, Mumps and Rubella (MMR) Vaccine Administered VS_1": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.110.12.1031'
valueset "Measles, Mumps and Rubella (MMR) Vaccine Administered VS_2": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.110.11.1085'

code "measles, mumps, rubella, and varicella virus vaccine code": '94' from "Other" display 'measles, mumps, rubella, and varicella virus vaccine'
code "measles, mumps and rubella virus vaccine code": '03' from "Other" display 'measles, mumps and rubella virus vaccine'

valueset "Pregnant (ICD10CM) VS": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1146.1986'
valueset "Pregnant (SNOMED) VS": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1146.676'
valueset "Pregnant State VS": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.3157.4055'



parameter Imm List<Immunization>
parameter Conditions List<Condition>

context Patient



define "PregValusets":
    Common.Pregnacy_All_Valuesets

define "MMRValuesets":
    Common.MMR_All_Valuesets

define "MMRVaccine_NonExist":
    Count(Common.FindValidVaccines(Imm)) = 0



define "Pregnant_Exist":
  Count(Common.FindValidPregnantCondition(Conditions)) > 0




define "InPopulation":
   MMRVaccine_NonExist and Pregnant_Exist


   /*
   rationale
   If patient does not have MMR or MMRV records and patient is pregnant, schedule 1st dose of MMR after pregnancy and 2nd dose after 4 weeks of the 1st dose

   */


define "Recommendation1":
    if InPopulation then
        'Recommendation 1: Schedule 1st dose MMR after pregnancy'
    else null

define "Recommendation2":
    if InPopulation then
        'Recommendation 2: Schedule 2nd dose MMR after 4 weeks of 1st dose'
    else null

