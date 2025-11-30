//jshint esversion:6

// Import the express module to use its functionalities for creating the server.
const express = require("express");

// Import the body-parser module, which is used to parse incoming request bodies before your handlers,
// available under the req.body property.
const bodyParser = require("body-parser");

// Import the date module we created earlier which contains the getDate and getDay functions.
// '__dirname' is a global object in Node which returns the directory of the current module.
//module that abstracts away date-related operations.
const date = require(__dirname + "/date.js");

// Initialize a new express application.
const app = express();

// Set EJS as the templating engine for the express application.
//EJS is chosen for its simplicity in integrating JavaScript with HTML templates.
app.set('view engine', 'ejs');

// Use body-parser middleware to parse form data sent via HTTP POST.
// The body - parser middleware is crucial for handling POST request payloads.
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files, such as CSS or JS, from the 'public' directory.
// Express serves the public directory, allowing access to CSS/JS assets.
app.use(express.static("public"));

// Items array to store the to-do list items.
//const items = ["Buy Food", "Cook Food", "Eat Food"];

// Separate array to store work-related to-do items.
//const workItems = [];

// This will be a Map instead of an array
// Maps over arrays for storing items provides better performance for item manipulation.
const items = new Map();
const workItems = new Map();

// Add some initial items to the Map
// Seeding the map with initial values to simulate a pre-existing list.
items.set('1', 'Buy Food');
items.set('2', 'Cook Food');
items.set('3', 'Eat Food');

// Define a route handler for the root route (homepage).
// This home route handler displays the current to -do list items by date.
app.get("/", function (req, res) {
  // Call the getDate function from our date module which returns the current date formatted.
  const day = date.getDay();

  // Convert the Map to an Array of objects for EJS to iterate over
  // Transforming the map into an array of objects to leverage EJS's iteration capabilities.
  const itemList = Array.from(items, ([uid, text]) => ({ uid, text }));
  // Render the 'list' EJS template and pass in a JavaScript object containing data for the template.
  // 'listTitle' is set to the current day and 'newListItems' is set to the items in our to-do list.
  res.render("list-map", { listTitle: day, newListItems: itemList });
});

// Define a route handler for HTTP POST requests to the root route.
// This item addition handler manages the addition of new to -do items to any list.
app.post("/", function (req, res) {
  // Retrieve the new item from the form input named 'newItem' (from the body of the POST request).
  const itemText = req.body.newItem;
  const listName = req.body.listName;
  const uid = Date.now().toString(); // Simple UID generator for example purposes

  console.log("I am at a post route and then listName I am dealing with is... ", listName);

  // Check if the POST request came from the 'Work' list form.
  // Differentiating between work and main list based on the listName.
  if (listName === "Work") {
    // If it is from 'Work', add the item to the workItems array.
    workItems.set(uid, itemText); // Work list item addition.

    // Redirect to the '/work' route which will trigger the GET handler for that route.
    res.redirect("/work"); // Redirection to the work list route for immediate view update.
  } else {
    // If it is from the main list, add the item to the items array.
    items.set(uid, itemText); // Main list item addition.
    // Redirect back to the root route, which will trigger the GET handler for the root route.
    res.redirect("/");
  }

});

// Define a GET route handler for the '/work' route.
// Work list route handler works imilar to the home route but specifically for the work-related list.
app.get("/work", function (req, res) {
  // Render the 'list' template with 'Work' as the title and the workItems array for the list items.
  console.log("I am in get work")
  // Convert the Map to an Array of objects for EJS to iterate over
  const itemList = Array.from(workItems, ([uid, text]) => ({ uid, text }));

  res.render("list-map", { listTitle: "Work", newListItems: itemList });
});

// Item deletion handler manages the removal of items from the list.
app.post("/delete", function (req, res) {
  const uidToDelete = req.body.uid; // Identifying which item to delete based on its UID.
  const listName = req.body.listName;

  if (listName === "Work") { // Similar hidden input strategy to differentiate the source list.
    workItems.delete(uidToDelete); // Deletion from the work list.
    res.redirect("/work"); // Immediate redirection for list update.
  } else {
    items.delete(uidToDelete); // Deletion from the main list.
    res.redirect("/");
  }
});

// Define a GET route handler for the '/about' route.
app.get("/about", function (req, res) {
  // Render the 'about' template. No data is passed to the 'about' template.
  res.render("about");
});

// Start the server on port 3000 and log a message to the console once the server is running.
//In JavaScript, the logical OR (||) operator returns the first operand if it is truthy, and its second operand otherwise.
const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log("Server started on port", PORT);
});
