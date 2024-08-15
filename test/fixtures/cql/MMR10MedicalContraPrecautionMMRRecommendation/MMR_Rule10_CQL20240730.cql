library "MMR10MedicalContraPrecautionMMRRecommendation" version '1'

include "MMR_Common_Library" version '1' called Common

using FHIR version '4.0.1'

include "FHIRHelpers" version '4.0.1' called FHIRHelpers


parameter Imm List<Immunization>
parameter Conditions List<Condition>

context Patient



define "VaccineName":
    'Measles, Mumps, and Rubella Virus Vaccine'


define "MMR_Vaccine_OneDose":
  Count(Common.FindValidVaccines(Imm)) = 1


define "Pregnant_Exist":
  Count(Common.FindValidPregnantCondition(Conditions)) > 0




define "InPopulation":
   MMR_Vaccine_OneDose and Pregnant_Exist


   /*
   rationale
   If patient does not have MMR or MMRV records and patient is pregnant, schedule 1st dose of MMR after pregnancy and 2nd dose after 4 weeks of the 1st dose

   */



define "Recommendation1":
    if InPopulation then
        'Schedule/admininster 2nd dose after pregnancy, >= 4 wk of 1st dose'
    else null

