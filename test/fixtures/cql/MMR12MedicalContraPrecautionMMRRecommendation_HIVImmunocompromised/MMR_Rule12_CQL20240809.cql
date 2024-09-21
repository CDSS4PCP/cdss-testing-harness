library "MMR12MedicalContraPrecautionMMRRecommendation_HIVImmunocompromised" version '1'

include "MMR_Common_Library" version '1' called Common

using FHIR version '4.0.1'

include "FHIRHelpers" version '4.0.1' called FHIRHelpers

codesystem "CONDCLINSTATUS": 'http://terminology.hl7.org/CodeSystem/condition-clinical'


parameter Conditions List<Condition>
parameter Observations List<Observation>

code "Condition Active code": 'active' from "CONDCLINSTATUS" display 'Active'

concept "Condition Active": { "Condition Active code" } display 'Active'

context Patient


define function ActiveCondition(CondList List<Condition>):
  CondList C
    where C.clinicalStatus ~ "Condition Active"
      and C.abatement is null


 define "HIV_or_AIDS_Condition":
  Count(Common.FindValidHivAidsCondition(ActiveCondition(Conditions))) > 0


define "HIV_or_AIDS_Observation":
    Count(Common.FindValidHivAidsObservation(Observations)) > 0


define "InPopulation":
   HIV_or_AIDS_Condition or "HIV_or_AIDS_Observation"

define "Recommendation1":
    if InPopulation then
        'DO NOT ADMINISTER OR SCHEDULE MMR'
    else
        null




