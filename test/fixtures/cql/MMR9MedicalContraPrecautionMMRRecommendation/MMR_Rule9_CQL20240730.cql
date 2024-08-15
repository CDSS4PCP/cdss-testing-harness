library "MMR9MedicalContraPrecautionMMRRecommendation" version '1'

//include "MMR_Common_Library" version '1' called Common

using FHIR version '4.0.1'

include "FHIRHelpers" version '4.0.1' called FHIRHelpers
include "MMR_Common_Library" version '1' called Common



parameter Imm List<Immunization>
parameter Conditions List<Condition>

context Patient


define "VaccineName":
    'Measles, Mumps, and Rubella Virus Vaccine'



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

