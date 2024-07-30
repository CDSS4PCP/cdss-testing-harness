const DAYS_IN_WEEK = 7;
const MONTHS_IN_YEAR = 12;

/**
 * Get the current time as a Date
 *
 * @return {Date} Current time as a Date
 */
function getCurrentTime() {
  return new Date();
}

/**
 * Get the number of days between two dates
 *
 * @param {Date} date1 First date. Must be before date2.
 * @param {Date} date2 Second date. Must be after date1.
 * @return {number} Number of days. If exceeds integer size, Number.MAX_SAFE_INTEGER is returned.
 */
function getNumberOfDays(date1, date2) {
  const numDays = (date2 - date1) / (1000 * 60 * 60 * 24);
  return numDays < Number.MAX_SAFE_INTEGER ? Math.floor(numDays) : Number.MAX_SAFE_INTEGER;
}

/**
 * Get the number of weeks between two dates
 *
 * @param {Date} date1 First date. Must be before date2.
 * @param {Date} date2 Second date. Must be after date1.
 * @return {number} Number of weeks.
 */
function getNumberOfWeeks(date1, date2) {
  return Math.floor(getNumberOfDays(date1, date2) / DAYS_IN_WEEK);
}

/**
 * Get the number of months between two dates
 *
 * @param {Date} date1 First date. Must be before date2.
 * @param {Date} date2 Second date. Must be after date1.
 * @return {number} Number of months.
 */
function getNumberOfMonths(date1, date2) {
  let numMonths = 0;
  let calendar1 = new Date(date1);
  let calendar2 = new Date(date1);
  calendar2.setMonth(calendar2.getMonth() + 1);

  while (date2 > calendar1 && date2 > calendar2) {
    if (date2 > calendar1 && date2 < calendar2) {
      return numMonths;
    } else if (date2 > calendar1 && date2 > calendar2) {
      numMonths++;
      calendar2.setMonth(calendar2.getMonth() + 1);
      calendar1.setMonth(calendar1.getMonth() + 1);
    }
  }

  if (calendar2.getDate() === date2.getDate()) {
    return numMonths + 1;
  }

  return numMonths;
}

/**
 * Get the number of years between two dates
 *
 * @param {Date} date1 First date. Must be before date2.
 * @param {Date} date2 Second date. Must be after date1.
 * @return {number} Number of years.
 */
function getNumberOfYears(date1, date2) {
  const numMonths = getNumberOfMonths(date1, date2);
  return Math.floor(numMonths / MONTHS_IN_YEAR);
}

// Example usage:
// const now = getCurrentTime();
// const daysBetween = getNumberOfDays(new Date('2024-01-01'), new Date('2024-01-10'));


module.exports = { getCurrentTime, getNumberOfDays, getNumberOfWeeks, getNumberOfMonths };
