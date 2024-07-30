library "MMR_Common_Library" version '1'

using FHIR version '4.0.1'
//using QUICK

//include "FHIRHelpers" version '4.0.1' called FHIRHelpers


codesystem "Other": 'http://hl7.org/fhir/sid/cvx'
codesystem "Snomed": 'http://snomed.info/sct'

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
code "Single Pregnacy": '237244005' from "Snomed" display 'Single Pregnacy'

context Patient



define "MMR_All_Valuesets":
    MMR_Vaccine_valuesets union MMR_Vaccine_Admin_valuesets union MMR_Vaccine_CVXCodes


define "MMR_Vaccine_valuesets":
     "Measles, Mumps and Rubella (MMR) Vaccine VS"
    union  "Measles, Mumps and Rubella (MMR) Vaccine VS_1"

define "MMR_Vaccine_Admin_valuesets":
  "Measles, Mumps and Rubella (MMR) Vaccine Administered VS"
        union  "Measles, Mumps and Rubella (MMR) Vaccine Administered VS_1"
    union  "Measles, Mumps and Rubella (MMR) Vaccine Administered VS_2"

define "MMR_Vaccine_CVXCodes":
  "measles, mumps, rubella, and varicella virus vaccine code"
    union "measles, mumps and rubella virus vaccine code"


define "Pregnacy_All_Valuesets":
    ("Pregnant (ICD10CM) VS" union "Pregnant (SNOMED) VS" union "Pregnant State VS") union "Single Pregnacy"

define function ToCode (coding FHIR.Coding):
     System.Code{
	 code: coding.code.value,
	 system: coding.system.value,
	 version: coding.version.value,
	 display: coding.display.value
	 }

define function FindValidCodes(codes List<FHIR.Coding>):
    codes c where ToCode(c) in "MMR_All_Valuesets"

define function FindValidVaccines(Immunizations List<Immunization>):
    Immunizations Temp where  (FindValidCodes(Temp.vaccineCode.coding)) is not null

define function FindValidPregnancyCodes(codes List<FHIR.Coding>):
    codes c where ToCode(c) in "Pregnacy_All_Valuesets"

define function FindValidPregnantCondition(Conditions List<Condition>):
    Conditions Temp where ((FindValidPregnancyCodes(Temp.code.coding)) is not null)
