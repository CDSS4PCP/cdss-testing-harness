library "MMR3regularyoungerthan47months_18yrsNoMMRRecommendation" version '1'

//include "MMR_Common_Library" version '1' called Common

using FHIR version '4.0.1'

include "FHIRHelpers" version '4.0.1' called FHIRHelpers
include "MMR_Common_Library" version '1' called Common

//MMR valuesets and codesystems

//codesystem "Other": 'http://hl7.org/fhir/sid/cvx'

//valueset "Measles, Mumps and Rubella (MMR) Vaccine Administered VS": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.110.11.1086'
//valueset "Measles, Mumps and Rubella (MMR) Vaccine VS": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.196.11.1235'
//valueset "Measles, Mumps and Rubella (MMR) Vaccine VS_1": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.196.12.1224'
//valueset "Measles, Mumps and Rubella (MMR) Vaccine Administered VS_1": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.110.12.1031'
//valueset "Measles, Mumps and Rubella (MMR) Vaccine Administered VS_2": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.110.11.1085'
//
//code "measles, mumps, rubella, and varicella virus vaccine code": '94' from "Other" display 'measles, mumps, rubella, and varicella virus vaccine'
//code "measles, mumps and rubella virus vaccine code": '03' from "Other" display 'measles, mumps and rubella virus vaccine'
//
parameter Imm List<Immunization>

context Patient


//define "MMR_Vaccine_valuesets":
//      [Immunization: "Measles, Mumps and Rubella (MMR) Vaccine VS"]
//    union [Immunization: "Measles, Mumps and Rubella (MMR) Vaccine VS_1"]
//
//		define "MMR_Vaccine_Admin_valuesets":
//  [Immunization: "Measles, Mumps and Rubella (MMR) Vaccine Administered VS"]
//        union [Immunization: "Measles, Mumps and Rubella (MMR) Vaccine Administered VS_1"]
//    union [Immunization: "Measles, Mumps and Rubella (MMR) Vaccine Administered VS_2"]
//
//define "MMR_Vaccine_CVXCodes":
//  [Immunization: "measles, mumps, rubella, and varicella virus vaccine code"]
//    union [Immunization: "measles, mumps and rubella virus vaccine code"]


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
        'Recommendation 1: Adminster 1 dose'
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
