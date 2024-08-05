library "MMR12MedicalContraPrecautionMMRRecommendation_HIVImmunocompromised" version '1'

include "MMR_Common_Library" version '1' called Common

using FHIR version '4.0.1'

include "FHIRHelpers" version '4.0.1' called FHIRHelpers

codesystem "CONDCLINSTATUS": 'http://terminology.hl7.org/CodeSystem/condition-clinical'

valueset "CD4 Percentage VS": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.121.12.1005'
valueset "CD4+ Percentage VS": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.121.11.1009'
valueset "CD4 Count VS": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.121.12.1004'
valueset "CD4+ Count VS": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.121.11.1006'

parameter Conditions List<Condition>
parameter Observations List<Observation>

code "Condition Active code": 'active' from "CONDCLINSTATUS" display 'Active'

concept "Condition Active": { "Condition Active code" } display 'Active'

context Patient


define function ActiveCondition(CondList List<Condition>):
  CondList C
    where C.clinicalStatus ~ "Condition Active"
      and C.abatement is null


 define "HIV_or_AIDS":
  Count(Common.FindValidHivAidsCondition(ActiveCondition(Conditions))) > 0

define "InPopulation":
   HIV_or_AIDS

define "Recommendation1":
    if InPopulation then
        'DO NOT ADMINISTER OR SCHEDULE MMR'
    else
        null


//
//
//
//
//define function HighestObservation(Observation List<Observation>):
//  Max(Observation O where  FHIRHelpers.ToQuantity(O.valueQuantity as FHIR.Quantity) is not null)
//
//define "CD4 Percentage":
//   (HighestObservation([Observation: "CD4 Percentage VS"]) < 15%)
//   or
//  (HighestObservation([Observation: "CD4+ Percentage VS"]) < 15%)
//
//
//
//
//
//define "CD4 Count":
//    ((HighestObservation([Observation: "CD4 Count VS"]) < 200/mm3)
//  or
//  (HighestObservation([Observation: "CD4+ Count VS"]) < 200/mm3)) is not null
//
//
//define "total_CD4":
// exists (Observation obs
// where (obs) in ("CD4 Percentage" union "CD4 Count") )
//
//
//
//define "InPopulation":
//   total_CD4 and HIV_or_AIDS
//
//
//define "Recommendation 1: DO NOT ADMINISTER OR SCHEDULE MMR":
//   InPopulation

