library "MMR1regularyoungerthan12monthsNoMMRRecommendation" version '1'


using FHIR version '4.0.1'

include "FHIRHelpers" version '4.0.1'
include "MMR_Common_Library" version '1' called Common




parameter Imm List<Immunization>


context Patient


//define "allSets":
//    Common.MMR_All_Valuesets

define "VaccineName":
    'Measles, Mumps, and Rubella Virus Vaccine'



define "CurrentAge":
  AgeInMonths() >= 0
    and AgeInMonths() < 12




define "InPopulation":
   CurrentAge and  Count(Common.FindValidVaccines(Imm)) = 0

//define "Recommendation":
//    if InPopulation then
//        {'Recommendation 1: Schedule 1st dose MMR when patient is 12-15 months','Recommendation 2: Schedule 2nd dose MMR when patient is 4-6 years'}
//    else
//        'No recommendation'

define "Recommendation1":
    if InPopulation then
        'Recommendation 1: Schedule 1st dose MMR when patient is 12-15 months'
    else null

define "Recommendation2":
    if InPopulation then
        'Recommendation 2: Schedule 2nd dose MMR when patient is 4-6 years'
    else null


