library "MMR3regularyoungerthan47months_18yrsNoMMRRecommendation" version '1'


using FHIR version '4.0.1'

include "FHIRHelpers" version '4.0.1' called FHIRHelpers
include "MMR_Common_Library" version '1' called Common


parameter Imm List<Immunization>

context Patient


define "VaccineName":
    'Measles, Mumps, and Rubella Virus Vaccine'



define "CurrentAge":
  AgeInMonths() > 47
    and AgeInYears() <= 18


define "MMRVaccine_NonExist":
  Count(Common.FindValidVaccines(Imm)) = 0

define "InPopulation":
    CurrentAge  and MMRVaccine_NonExist

define "Recommendation1":
    if InPopulation then
        'Recommendation 1: Administer 1 dose'
    else
        null

define "Recommendation2":
    if InPopulation then
        'Recommendation 2: Schedule 2nd dose > = 4 wk of 1st dose'
    else
        null

define "Recommendation":
    if InPopulation then
        {Recommendation1, Recommendation2}
    else
        null
