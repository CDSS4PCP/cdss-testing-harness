library "MMR11MedicalContraPrecautionMMRRecommendation_Immunocompromised" version '1'

include "MMR_Common_Library" version '1' called Common

using FHIR version '4.0.1'

include "FHIRHelpers" version '4.0.1' called FHIRHelpers


parameter Conditions List<Condition>




context Patient

define "InPopulation":
   Count(Common.FindValidImmunocompromisedCondition(Conditions)) > 0


   /*
   rationale
   If patient does not have MMR or MMRV records and patient is pregnant, schedule 1st dose of MMR after pregnancy and 2nd dose after 4 weeks of the 1st dose

   */

define "Recommendation1":
    if InPopulation then
        'DO NOT ADMINISTER OR SCHEDULE MMR'
    else
        null


