// https://github.com/d3/d3/blob/master/CHANGES.md#time-formats-d3-time-format
// http://bl.ocks.org/mayo/e27554b34bff1f177c05

import * as d3 from "d3";
var weekday = (function() {

// Returns the weekday number for the given date relative to January 1, 1970.
function weekday(date) {
  var weekdays = weekdayOfYear(date),
      year = date.getFullYear();
  while (--year >= 1970) weekdays += weekdaysInYear(year);
  
  return weekdays;
}

// Returns the date for the specified weekday number relative to January 1, 1970.
weekday.invert = function(weekdays) {
  var year = 1970,
      yearWeekdays;
 
  // Compute the year.
  while ((yearWeekdays = weekdaysInYear(year)) <= weekdays) {
    ++year;
    weekdays -= yearWeekdays;
  }
 
  // Compute the date from the remaining weekdays.
  var days = weekdays % 5,
      day0 = ((new Date(year, 0, 1)).getDay() + 6) % 7;
  if (day0 + days > 4) days += 2;
  return new Date(year, 0, (weekdays / 5 | 0) * 7 + days + 1);
};

// Returns the number of weekdays in the specified year.
function weekdaysInYear(year) {
  return weekdayOfYear(new Date(year, 11, 31)) + 1;
}

// Returns the weekday number for the given date relative to the start of the year.
function weekdayOfYear(date) {
  // console.log(d3)
  // var days = d3.time.dayOfYear(date),
  var days = d3.timeDay.count(d3.timeYear(date), date),  
      weeks = days / 7 | 0,
      day0 = (d3.timeYear(date).getDay() + 6) % 7,
      day1 = day0 + days - weeks * 7;
  return Math.max(0, days - weeks * 2
      - (day0 <= 5 && day1 >= 5 || day0 <= 12 && day1 >= 12) // extra saturday
      - (day0 <= 6 && day1 >= 6 || day0 <= 13 && day1 >= 13)); // extra sunday
}

return weekday;

})();

export default weekday