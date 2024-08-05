const dotenv = require('dotenv');

const vsac = require('cql-exec-vsac');
const {
  executeCql,
} = require('cdss-common/src/cdss-module');
const {
  defaultLoadElm,
  defaultLoadPatients,
} = require('../src');
const {
  getNumberOfMonths,
  getNumberOfWeeks,
} = require('./timeUtil');

// Initialize the env variables
dotenv.config();

const API_KEY = process.env.VSAC_API_KEY;
const VALUESETS_CACHE = process.env.VALUESETS;
let elms;
let patientBundles;
let libraries;
let now;
// const now= new Date('2024-08-05');

beforeAll(() => {
  // Setup today's date for tests that use time based calculations
  now = new Date('2024-08-05'); // ATTENTION: This may need to be modified based on the tests
  // now = new Date();
  // Set up necessary data for cql-execution
  elms = defaultLoadElm();

  // Load patients
  const bundles = defaultLoadPatients();

  // Group patientBundles by bundle Id
  patientBundles = {};
  bundles.forEach((bundle) => {
    patientBundles[bundle.id] = bundle;
  });

  // Define libraries
  libraries = {
    FHIRHelpers: elms.FHIRHelpers,
    Common: elms.MMR_Common_Library,
  };
});

// Tests using JEST (https://jestjs.io/docs/getting-started)

describe('MMR Rule 1\n\tVaccineName should be Measles, Mumps, and Rubella Virus Vaccine, Patient birthdate should be < 12 mon, No previous dose, Recommendations should be Schedule 1st dose 12-15 mon of age AND Schedule 2nd dose 4-6 yr of age', () => {
  test('Testing age and recommendation', async () => {
    const rule = elms.MMR1regularyoungerthan12monthsNoMMRRecommendation;

    const patient = patientBundles.MMR1regularyoungerthan12monthsNoMMRRecommendation.entry[0].resource;

    const codeService = new vsac.CodeService(VALUESETS_CACHE, true, true);
    const result = await executeCql(patient, rule, libraries, { 'Imm': [] }, codeService, API_KEY);
    expect(result)
      .not
      .toBeNull();
    const patientResult = result[patient.id];

    const patientBod = new Date(patient.birthDate);

    const ageInMonths = getNumberOfMonths(patientBod, now);

    expect(patientResult.VaccineName)
      .toEqual('Measles, Mumps, and Rubella Virus Vaccine');
    expect(ageInMonths)
      .toBeLessThan(12);
    expect(ageInMonths)
      .toBeGreaterThan(0);

    expect(patientResult.Recommendations)
      .toHaveLength(2);
    expect(patientResult.Recommendations[0].recommendation)
      .toEqual(expect.stringContaining('Recommendation 1: Schedule 1st dose MMR when patient is 12-15 months'));

    expect(patientResult.Recommendations[1].recommendation)
      .toEqual(expect.stringContaining('Recommendation 2: Schedule 2nd dose MMR when patient is 4-6 years'));
  });
});

describe('MMR Rule 2:\n\tVaccineName should be Measles, Mumps, and Rubella Virus Vaccine, Patient birthdate should be >= 12 mon AND <= 47 mon, No previous dose, Recommendations should be Administer 1st dose AND Schedule 2nd dose 4-6 yr of age', () => {
  test('Testing age and recommendation', async () => {
    const rule = elms.MMR2regularyoungerthan12_47monthsNoMMRRecommendation;
    const patient = patientBundles.MMR2regularyoungerthan12_47monthsNoMMRRecommendation.entry[0].resource;

    const codeService = new vsac.CodeService(VALUESETS_CACHE, true);
    const result = await executeCql(patient, rule, libraries, { 'Imm': [] }, codeService, API_KEY);
    expect(result)
      .not
      .toBeNull();

    const patientResult = result[patient.id];

    const patientBod = new Date(patient.birthDate);

    const ageInMonths = getNumberOfMonths(patientBod, now);
    expect(patientResult.VaccineName)
      .toEqual('Measles, Mumps, and Rubella Virus Vaccine');
    expect(ageInMonths)
      .toBeGreaterThanOrEqual(12);
    expect(ageInMonths)
      .toBeLessThanOrEqual(47);

    expect(patientResult.Recommendations)
      .toHaveLength(2);
    expect(patientResult.Recommendations[0].recommendation)
      .toEqual(expect.stringContaining('Recommendation 1: Administer 1st dose'));

    expect(patientResult.Recommendations[1].recommendation)
      .toEqual(expect.stringContaining('Schedule 2nd dose 4-6 yr of age'));
  });
});

describe('MMR Rule 3:\n\tVaccineName should be Measles, Mumps, and Rubella Virus Vaccine, Patient birthdate should be > 47 mon AND <= 18 yrs, No previous dose, Recommendations should be Administer 1st dose AND Schedule 2nd dose > = 4 wk of 1st dose ', () => {
  test('Testing age and recommendation', async () => {
    const rule = elms.MMR3regularyoungerthan47months_18yrsNoMMRRecommendation;
    const patient = patientBundles.MMR3regularyoungerthan47months_18yrsNoMMRRecommendation.entry[0].resource;

    const codeService = new vsac.CodeService(VALUESETS_CACHE, true);
    const result = await executeCql(patient, rule, libraries, { 'Imm': [] }, codeService, API_KEY);
    expect(result)
      .not
      .toBeNull();

    const patientResult = result[patient.id];

    const patientBod = new Date(patient.birthDate);

    const ageInMonths = getNumberOfMonths(patientBod, now);
    expect(patientResult.VaccineName)
      .toEqual('Measles, Mumps, and Rubella Virus Vaccine');
    expect(ageInMonths)
      .toBeGreaterThanOrEqual(47);
    expect(ageInMonths)
      .toBeLessThanOrEqual(18 * 12);

    expect(patientResult.Recommendations)
      .toHaveLength(2);
    expect(patientResult.Recommendations[0].recommendation)
      .toEqual(expect.stringContaining('Recommendation 1: Administer 1 dose'));

    expect(patientResult.Recommendations[1].recommendation)
      .toEqual(expect.stringContaining('Recommendation 2: Schedule 2nd dose > = 4 wk of 1st dose'));
  });
});

describe('MMR Rule 4:\n\tVaccineName should be Measles, Mumps, and Rubella Virus Vaccine, Patient birthdate should be > 12 mon AND < 4 yr, Single does of MMR administered at 12 - 15 mon of age, Recommendation should be Schedule 2nd dose 4-6 yr of age', () => {
  test('Testing age, recommendations when single dose of MMR was administered 12-15 months of age', async () => {
    const rule = elms.MMR4regular12months_4yrs_OneMMRRecommendation;
    const patient = patientBundles.MMR4regular12months_4yrs_OneMMRRecommendation.entry[0].resource;

    // const patient = firstPatientBundle.entry[0].resource;
    const immunization = patientBundles.MMR4regular12months_4yrs_OneMMRRecommendation.entry[1].resource;
    const immBundle = {
      resourceType: 'Bundle',
      entry: [{ resource: immunization }],
    };

    const codeService = new vsac.CodeService(VALUESETS_CACHE, true);
    const result = await executeCql(patient, rule, libraries, { Imm: immBundle }, codeService, API_KEY);

    const patientResult = result[patient.id];

    const patientBod = new Date(patient.birthDate);
    const immunizationAdminDate = new Date(immunization.occurrenceDateTime);

    const ageInMonths = getNumberOfMonths(patientBod, now);
    const adminAgeInMonths = getNumberOfMonths(patientBod, immunizationAdminDate);

    expect(patientResult.VaccineName)
      .toEqual('Measles, Mumps, and Rubella Virus Vaccine');
    expect(ageInMonths)
      .toBeLessThan(4 * 12);
    expect(ageInMonths)
      .toBeGreaterThan(12);
    expect(adminAgeInMonths)
      .toBeLessThan(15);
    expect(adminAgeInMonths)
      .toBeGreaterThan(12);
    expect(immBundle.entry)
      .toHaveLength(1);
    expect(patientResult.Recommendations)
      .toHaveLength(1);
    expect(patientResult.Recommendations[0].recommendation)
      .toEqual(expect.stringContaining('Schedule 2nd dose MMR when patient is 4-6 years old'));
  });
});

describe('MMR Rule 5:\n\tVaccineName should be Measles, Mumps, and Rubella Virus Vaccine, Patient birthdate should be > 12 mon AND < 4 yr, Single does of MMR administered at < 12 mon OR > 15 mon and current date must be >= 4 weeks since last admin date, Recommendation should be Administer 2nd Dose', () => {
  test('Testing age, recommendations when single dose of MMR was administered   < 12 mon OR > 15 mon and current date must be >= 4 weeks since last admin date', async () => {
    const rule = elms.MMR5regular12months_4yrs_OneDoseOutOf12to15MonRecommendation;
    const patient = patientBundles.MMR5regular12months_4yrs_OneDoseOutOf12to15MonRecommendation1.entry[0].resource;

    const immunization = patientBundles.MMR5regular12months_4yrs_OneDoseOutOf12to15MonRecommendation1.entry[1].resource;
    const immBundle = {
      resourceType: 'Bundle',
      entry: [{ resource: immunization }],
    };

    const codeService = new vsac.CodeService(VALUESETS_CACHE, true);
    const result = await executeCql(patient, rule, libraries, { Imm: immBundle }, codeService, API_KEY);

    const patientResult = result[patient.id];

    const patientBod = new Date(patient.birthDate);
    const immunizationAdminDate = new Date(immunization.occurrenceDateTime);

    const ageInMonths = getNumberOfMonths(patientBod, now);
    const adminAgeInMonths = getNumberOfMonths(patientBod, immunizationAdminDate);

    const weeksSinceFirstDose = getNumberOfWeeks(immunizationAdminDate, now);
    expect(patientResult.VaccineName)
      .toEqual('Measles, Mumps, and Rubella Virus Vaccine');
    expect(patientResult.InPopulation)
      .toBeTruthy();
    expect(ageInMonths)
      .toBeLessThan(4 * 12);
    expect(ageInMonths)
      .toBeGreaterThan(12);

    expect(adminAgeInMonths < 12 || adminAgeInMonths > 15)
      .toBeTruthy();

    expect(weeksSinceFirstDose)
      .toBeGreaterThanOrEqual(4);
    expect(immBundle.entry)
      .toHaveLength(1);
    expect(patientResult.Recommendations)
      .toHaveLength(1);
    expect(patientResult.Recommendations[0].recommendation)
      .toEqual(expect.stringContaining('Administer 2nd dose MMR'));
  });
  test('VaccineName should be Measles, Mumps, and Rubella Virus Vaccine, Patient birthdate should be > 12 mon AND < 4 yr, Single does of MMR administered at < 12 mon OR > 15 mon and current date must be >= 4 weeks since last admin date, Recommendation should be Administer 2nd Dose', async () => {
    const rule = elms.MMR5regular12months_4yrs_OneDoseOutOf12to15MonRecommendation;
    const patient = patientBundles.MMR5regular12months_4yrs_OneDoseOutOf12to15MonRecommendation2.entry[0].resource;

    const immunization = patientBundles.MMR5regular12months_4yrs_OneDoseOutOf12to15MonRecommendation2.entry[1].resource;
    const immBundle = {
      resourceType: 'Bundle',
      entry: [{ resource: immunization }],
    };

    const codeService = new vsac.CodeService(VALUESETS_CACHE, true);
    const result = await executeCql(patient, rule, libraries, { Imm: immBundle }, codeService, API_KEY);

    const patientResult = result[patient.id];

    const patientBod = new Date(patient.birthDate);
    const immunizationAdminDate = new Date(immunization.occurrenceDateTime);

    const ageInMonths = getNumberOfMonths(patientBod, now);
    const adminAgeInMonths = getNumberOfMonths(patientBod, immunizationAdminDate);

    const weeksSinceFirstDose = getNumberOfWeeks(immunizationAdminDate, now);
    expect(patientResult.VaccineName)
      .toEqual('Measles, Mumps, and Rubella Virus Vaccine');
    expect(patientResult.InPopulation)
      .toBeTruthy();
    expect(ageInMonths)
      .toBeLessThan(4 * 12);
    expect(ageInMonths)
      .toBeGreaterThan(12);

    expect(adminAgeInMonths < 12 || adminAgeInMonths > 15)
      .toBeTruthy();

    expect(weeksSinceFirstDose)
      .toBeGreaterThanOrEqual(4);
    expect(immBundle.entry)
      .toHaveLength(1);
    expect(patientResult.Recommendations)
      .toHaveLength(1);
    expect(patientResult.Recommendations[0].recommendation)
      .toEqual(expect.stringContaining('Administer 2nd dose MMR'));
  });

});

describe('MMR Rule 6:\n\tVaccineName should be Measles, Mumps, and Rubella Virus Vaccine, Patient birthdate should be > 12 mon AND < 4 yr, Single does of MMR administered at < 12 mon OR > 15 mon and current date must be < 4 weeks since last admin date, Recommendation should be Schedule 2nd dose >= 4 wk of 1st dose', () => {
  test('Testing age, recommendations when single dose of MMR was administered at 24 months of age', async () => {
    const rule = elms.MMR6regular12months_4yrs_OneDoseOutOf12to15MonRecommendation;
    const patient = patientBundles.MMR6regular12months_4yrs_OneDoseOutOf12to15MonRecommendation1.entry[0].resource;

    const immunization = patientBundles.MMR6regular12months_4yrs_OneDoseOutOf12to15MonRecommendation1.entry[1].resource;
    const immBundle = {
      resourceType: 'Bundle',
      entry: [{ resource: immunization }],
    };

    const codeService = new vsac.CodeService(VALUESETS_CACHE, true);
    const result = await executeCql(patient, rule, libraries, { Imm: immBundle }, codeService, API_KEY);

    const patientResult = result[patient.id];

    const patientBod = new Date(patient.birthDate);
    const immunizationAdminDate = new Date(immunization.occurrenceDateTime);

    const ageInMonths = getNumberOfMonths(patientBod, now);
    const adminAgeInMonths = getNumberOfMonths(patientBod, immunizationAdminDate);

    const weeksSinceFirstDose = getNumberOfWeeks(immunizationAdminDate, now);
    expect(patientResult.VaccineName)
      .toEqual('Measles, Mumps, and Rubella Virus Vaccine');
    expect(patientResult.InPopulation)
      .toBeTruthy();
    expect(ageInMonths)
      .toBeLessThan(4 * 12);
    expect(ageInMonths)
      .toBeGreaterThan(12);

    expect(adminAgeInMonths < 12 || adminAgeInMonths > 15)
      .toBeTruthy();

    expect(weeksSinceFirstDose)
      .toBeLessThan(4);
    expect(immBundle.entry)
      .toHaveLength(1);
    expect(patientResult.Recommendations)
      .toHaveLength(1);
    expect(patientResult.Recommendations[0].recommendation)
      .toEqual(expect.stringContaining('Schedule 2nd dose >= 4 wk of 1st dose'));
  });
});

describe('MMR Rule 7:\n\tVaccineName should be Measles, Mumps, and Rubella Virus Vaccine, Patient birthdate should be >= 12 4 yr AND <= 18 yr, Single does of MMR administered and  current date must be >= 4 weeks since last admin date, Recommendation should be Administer 2nd dose', () => {
  test('Testing age, recommendations when single dose of MMR was administered', async () => {
    const rule = elms.MMR7regular4_18yrs_OneDoseRecommendation;
    const patient = patientBundles.MMR7regular4_18yrs_OneDoseRecommendation.entry[0].resource;

    const immunization = patientBundles.MMR7regular4_18yrs_OneDoseRecommendation.entry[1].resource;
    const immBundle = {
      resourceType: 'Bundle',
      entry: [{ resource: immunization }],
    };

    const codeService = new vsac.CodeService(VALUESETS_CACHE, true);
    const result = await executeCql(patient, rule, libraries, { Imm: immBundle }, codeService, API_KEY);

    const patientResult = result[patient.id];

    const patientBod = new Date(patient.birthDate);
    const immunizationAdminDate = new Date(immunization.occurrenceDateTime);

    const ageInMonths = getNumberOfMonths(patientBod, now);

    const weeksSinceFirstDose = getNumberOfWeeks(immunizationAdminDate, now);
    expect(patientResult.VaccineName)
      .toEqual('Measles, Mumps, and Rubella Virus Vaccine');
    expect(patientResult.InPopulation)
      .toBeTruthy();
    expect(ageInMonths)
      .toBeLessThanOrEqual(18 * 12);
    expect(ageInMonths)
      .toBeGreaterThanOrEqual(4 * 12);

    expect(weeksSinceFirstDose)
      .toBeGreaterThanOrEqual(4);
    expect(immBundle.entry)
      .toHaveLength(1);
    expect(patientResult.Recommendations)
      .toHaveLength(1);
    expect(patientResult.Recommendations[0].recommendation)
      .toEqual(expect.stringContaining('Administer 2nd dose MMR'));
  });
});

describe('MMR Rule 8:\n\tVaccineName should be Measles, Mumps, and Rubella Virus Vaccine, Patient birthdate should be >= 12 4 yr AND <= 18 yr, Single does of MMR administered and  current date must be < 4 weeks since last admin date, Recommendation should be Schedule 2nd dose MMR >= 4 weeks from 1st dose', () => {
  test('Testing age, recommendations when single dose of MMR was administered', async () => {
    const rule = elms.MMR8regular4_18yrs_OneDoseRecommendation;
    const patient = patientBundles.MMR8regular4_18yrs_OneDoseRecommendation.entry[0].resource;
    const immunization = patientBundles.MMR8regular4_18yrs_OneDoseRecommendation.entry[1].resource;
    const immBundle = {
      resourceType: 'Bundle',
      entry: [{ resource: immunization }],
    };

    const codeService = new vsac.CodeService(VALUESETS_CACHE, true);
    const result = await executeCql(patient, rule, libraries, { Imm: immBundle }, codeService, API_KEY);

    const patientResult = result[patient.id];

    const patientBod = new Date(patient.birthDate);
    const immunizationAdminDate = new Date(immunization.occurrenceDateTime);

    const ageInMonths = getNumberOfMonths(patientBod, now);

    const weeksSinceFirstDose = getNumberOfWeeks(immunizationAdminDate, now);
    expect(patientResult.VaccineName)
      .toEqual('Measles, Mumps, and Rubella Virus Vaccine');
    // expect(patientResult.InPopulation)
    //   .toBeTruthy();
    expect(ageInMonths)
      .toBeLessThanOrEqual(18 * 12);
    expect(ageInMonths)
      .toBeGreaterThanOrEqual(4 * 12);

    expect(weeksSinceFirstDose)
      .toBeLessThan(4);
    expect(immBundle.entry)
      .toHaveLength(1);
    expect(patientResult.Recommendations)
      .toHaveLength(1);
    expect(patientResult.Recommendations[0].recommendation)
      .toEqual(expect.stringContaining('Schedule 2nd dose MMR >= 4 weeks from 1st dose'));
  });
});

describe('MMR Rule 9:\n\tVaccineName should be Measles, Mumps, and Rubella Virus Vaccine, with Pregnancy Condition, No previous dose, Recommendation should be Schedule/admin 1st dose after pregnancy AND Schedule 2nd dose >= 4 wk of 1st dose', () => {
  test('Testing age and recommendation with single pregnancy condition', async () => {

    const rule = elms.MMR9MedicalContraPrecautionMMRRecommendation;
    const patient = patientBundles.MMR9MedicalContraPrecautionMMRRecommendation.entry[0].resource;

    const condition = patientBundles.MMR9MedicalContraPrecautionMMRRecommendation.entry[1].resource;

    const codeService = new vsac.CodeService(VALUESETS_CACHE, true, true);
    const result = await executeCql(patient, rule, libraries, {
      Imm: [],
      Conditions: [condition],
    }, codeService, API_KEY);
    const patientResult = result[patient.id];

    expect(patientResult.Recommendations)
      .toHaveLength(2);
    expect(patientResult.Recommendations[0].recommendation)
      .toEqual(expect.stringContaining('Recommendation 1: Schedule 1st dose MMR after pregnancy'));

    expect(patientResult.Recommendations[1].recommendation)
      .toEqual(expect.stringContaining('Recommendation 2: Schedule 2nd dose MMR after 4 weeks of 1st dose'));
  });
});

describe('MMR Rule 10:\n\tVaccineName should be Measles, Mumps, and Rubella Virus Vaccine, with Pregnancy Condition, One previous dose, Recommendation should be Schedule/admin 2nd dose after pregnancy, >= 4 wk of 1st dose', () => {
  test('Testing age and recommendation with single pregnancy condition and one previous dose of MMR', async () => {

    const rule = elms.MMR10MedicalContraPrecautionMMRRecommendation;
    const patient = patientBundles.MMR10MedicalContraPrecautionMMRRecommendation.entry[0].resource;

    const condition = patientBundles.MMR10MedicalContraPrecautionMMRRecommendation.entry[1].resource;
    const immunization = patientBundles.MMR10MedicalContraPrecautionMMRRecommendation.entry[2].resource;

    const codeService = new vsac.CodeService(VALUESETS_CACHE, true, true);
    const result = await executeCql(patient, rule, libraries, {
      Imm: [immunization],
      Conditions: [condition],
    }, codeService, API_KEY);
    const patientResult = result[patient.id];

    expect(patientResult.Recommendations)
      .toHaveLength(1);
    expect(patientResult.Recommendations[0].recommendation)
      .toEqual(expect.stringContaining('Schedule/admininster 2nd dose after pregnancy, >= 4 wk of 1st dose'));

  });
});

describe('MMR Rule 11:\n\tVaccineName should be Measles, Mumps, and Rubella Virus Vaccine, with Immunocompromised Condition,  Recommendation should be DO NOT ADMINISTER OR SCHEDULE MMR', () => {
  test('Testing age, recommendations with single lymphoma immunocompromised condition', async () => {

    const rule = elms.MMR11MedicalContraPrecautionMMRRecommendation_Immunocompromised;
    const patient = patientBundles.MMR11MedicalContraPrecautionMMRRecommendation_Immunocompromised.entry[0].resource;

    const condition = patientBundles.MMR11MedicalContraPrecautionMMRRecommendation_Immunocompromised.entry[1].resource;

    const codeService = new vsac.CodeService(VALUESETS_CACHE, true, true);
    const result = await executeCql(patient, rule, libraries, {
      Conditions: [condition],
    }, codeService, API_KEY);
    const patientResult = result[patient.id];

    expect(patientResult.Recommendations)
      .toHaveLength(1);
    expect(patientResult.Recommendations[0].recommendation)
      .toEqual(expect.stringContaining('DO NOT ADMINISTER OR SCHEDULE MMR'));

  });
});

describe('MMR Rule 12:\n\tVaccineName should be Measles, Mumps, and Rubella Virus Vaccine, with Immunocompromised Condition,  Recommendation should be DO NOT ADMINISTER OR SCHEDULE MMR', () => {
  test('Testing recommendations with single HIV infection condition', async () => {

    const rule = elms.MMR12MedicalContraPrecautionMMRRecommendation_HIVImmunocompromised;
    const patient = patientBundles.MMR12MedicalContraPrecautionMMRRecommendation_HIVImmunocompromised.entry[0].resource;

    // const patient = firstPatientBundle.entry[0].resource;
    const condition = patientBundles.MMR12MedicalContraPrecautionMMRRecommendation_HIVImmunocompromised.entry[1].resource;

    const codeService = new vsac.CodeService(VALUESETS_CACHE, true, true);
    const result = await executeCql(patient, rule, libraries, {
      Conditions: [condition],
      Observations: [],
    }, codeService, API_KEY);
    const patientResult = result[patient.id];
    expect(patientResult.InPopulation)
      .toBeTruthy();

    expect(patientResult.Recommendations)
      .toHaveLength(1);
    expect(patientResult.Recommendations[0].recommendation)
      .toEqual(expect.stringContaining('DO NOT ADMINISTER OR SCHEDULE MMR'));

  });
  test('Testing recommendations with single positive CD3+CD4+ count in blood observation', async () => {

    const rule = elms.MMR12MedicalContraPrecautionMMRRecommendation_HIVImmunocompromised;
    const patient = patientBundles.MMR12MedicalContraPrecautionMMRRecommendation_HIVImmunocompromised2.entry[0].resource;

    const observation = patientBundles.MMR12MedicalContraPrecautionMMRRecommendation_HIVImmunocompromised2.entry[1].resource;

    const codeService = new vsac.CodeService(VALUESETS_CACHE, true, true);
    const result = await executeCql(patient, rule, libraries, {
      Conditions: [],
      Observations: [observation],
    }, codeService, API_KEY);
    const patientResult = result[patient.id];

    expect(patientResult.InPopulation)
      .toBeTruthy();
    expect(patientResult.Recommendations)
      .toHaveLength(1);
    expect(patientResult.Recommendations[0].recommendation)
      .toEqual(expect.stringContaining('DO NOT ADMINISTER OR SCHEDULE MMR'));

  });

  test('Testing recommendations with single positive CD3+CD4+ percent in blood observation', async () => {

    const rule = elms.MMR12MedicalContraPrecautionMMRRecommendation_HIVImmunocompromised;
    const patient = patientBundles.MMR12MedicalContraPrecautionMMRRecommendation_HIVImmunocompromised3.entry[0].resource;

    const observation = patientBundles.MMR12MedicalContraPrecautionMMRRecommendation_HIVImmunocompromised3.entry[1].resource;

    const codeService = new vsac.CodeService(VALUESETS_CACHE, true, true);
    const result = await executeCql(patient, rule, libraries, {
      Conditions: [],
      Observations: [observation],
    }, codeService, API_KEY);
    const patientResult = result[patient.id];

    expect(patientResult.InPopulation)
      .toBeTruthy();
    expect(patientResult.Recommendations)
      .toHaveLength(1);
    expect(patientResult.Recommendations[0].recommendation)
      .toEqual(expect.stringContaining('DO NOT ADMINISTER OR SCHEDULE MMR'));

  });

});

