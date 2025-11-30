//jshint esversion:6

// Export a function named 'getDate' which can be used to obtain a string representation
// of the current date with a full format including the day of the week, the month, and the day of the month.
exports.getDate = function () {

  // Create a new Date object that represents the current date and time.
  const today = new Date();

  // Define an 'options' object that specifies how the date should be formatted.
  // - 'weekday': "long" means the full name of the weekday (e.g., Monday)
  // - 'day': "numeric" means the numeric day of the month (e.g., 31)
  // - 'month': "long" means the full name of the month (e.g., December)
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  // Return the current date as a string formatted according to the locale 'en-US'
  // and the options defined above. The 'toLocaleDateString' method is used to
  // format the date with respect to a particular locale, in this case, U.S. English.
  return today.toLocaleDateString("en-US", options);
};

// Export another function named 'getDay' which provides a string representation
// of the current day of the week.
exports.getDay = function () {

  // Reuse the 'today' variable from above, creating a new Date object for the current date and time.
  const today = new Date();

  // Define a simpler 'options' object for this function, which only specifies the 'weekday'
  // property to be "long", meaning it will only show the full name of the weekday.
  const options = {
    weekday: "long"
  };

  // Return the current day as a string formatted to the 'en-US' locale, using only
  // the 'weekday' part of the 'options' object. This results in just the full weekday name.
  return today.toLocaleDateString("en-US", options);
};
