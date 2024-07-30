library "MMR6regular12months_4yrs_OneDoseOutOf12to15MonRecommendation" version '1'

include "MMR_Common_Library" version '1' called Common
using FHIR version '4.0.1'

using QUICK

include "FHIRHelpers" version '4.0.1' called FHIRHelpers


//immunization can be a list, not always only one value
parameter Imm List<Immunization>

context Patient


define "VaccineName":
    'Measles, Mumps, and Rubella Virus Vaccine'




define "CurrentAge":
  AgeInMonths() > 12
    and AgeInYears() < 4



//check to see if any existing immunization record is in MMR_Vaccine_union
//will all the vacines in the list be gone through one by one? if not, how to make them be checked one by one?

//this one dose can be from (MMR valueses OR CVS codes,) or MMR admin, however only one from either set


define "MMR_Vaccine_OneDose":
    Count (Common.FindValidVaccines (Imm))=1

define function MMRVaccineDate(Immunizations List<FHIR.Immunization>):
     (Imm TemDate
	 where (Common.FindValidCodes(TemDate.vaccineCode.coding)) in Common.MMR_All_Valuesets
  return Tuple {
  Date: Date(year from TemDate.occurrence.value,
                      month from TemDate.occurrence.value,
					  day from TemDate.occurrence.value)
    }
    sort by Date)

define "PrevDoseDate":
    MMRVaccineDate(Imm)[0].Date


define "AgeFirstFirstDoseMonths":
    months between Patient.birthDate and PrevDoseDate // This does not take years into account

define "AgeFirstMMRIn":
    AgeFirstFirstDoseMonths < 12 or AgeFirstFirstDoseMonths > 15

define "WeeksFromFirstDose":
    (difference in weeks between MMRVaccineDate(Imm)[0].Date and Today() )



define "InPopulation":
    MMR_Vaccine_OneDose and AgeFirstMMRIn and CurrentAge and WeeksFromFirstDose < 4

//parameters-Todo1
 define "Recommendation1":
     if InPopulation then
        'Schedule 2nd dose >= 4 wk of 1st dose'
     else
        null

