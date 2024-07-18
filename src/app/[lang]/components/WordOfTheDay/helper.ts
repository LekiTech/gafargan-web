export const isLeapYear = (date: Date) => {
  var year = date.getFullYear();
  if ((year & 3) != 0) {
    return false;
  }
  return year % 100 != 0 || year % 400 == 0;
};

/**
 * Get Day of Year starting from 1
 *
 * @param date Optional Date, if not provided, current date will be used
 * @returns Day of Year
 */
export const getDayOfYear = (date?: Date) => {
  const currentDate = date ?? new Date();
  var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  var mn = currentDate.getMonth();
  var dn = currentDate.getDate();
  var dayOfYear = dayCount[mn] + dn;
  if (mn > 1 && isLeapYear(currentDate)) {
    dayOfYear++;
  }
  return dayOfYear;
};
