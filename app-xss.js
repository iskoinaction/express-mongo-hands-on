//jshint esversion:6

// Import the express module to use its functionalities for creating the server.
const express = require("express");

// Import the body-parser module, which is used to parse incoming request bodies before your handlers,
// available under the req.body property.
const bodyParser = require("body-parser");

// Import the date module we created earlier which contains the getDate and getDay functions.
// '__dirname' is a global object in Node which returns the directory of the current module.
const date = require(__dirname + "/date.js");

// Initialize a new express application.
const app = express();

// Set EJS as the templating engine for the express application.
app.set('view engine', 'ejs');

// Use body-parser middleware to parse form data sent via HTTP POST.
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files, such as CSS or JS, from the 'public' directory.
app.use(express.static("public"));

// Items array to store the to-do list items.
const items = ["Buy Food", "Cook Food", "Eat Food"];

// Separate array to store work-related to-do items.
const workItems = [];

let userName = "pepito"

// Define a route handler for the root route (homepage).
app.get("/", function (req, res) {
  // Call the getDate function from our date module which returns the current date formatted.
  const day = date.getDate();

  // Render the 'list' EJS template and pass in a JavaScript object containing data for the template.
  // 'listTitle' is set to the current day and 'newListItems' is set to the items in our to-do list.
  res.render("list-xss", { listTitle: day, newListItems: items, userName: userName });
});

// Define a route handler for HTTP POST requests to the root route.
app.post("/", function (req, res) {
  // Retrieve the new item from the form input named 'newItem' (from the body of the POST request).
  const item = req.body.newItem;

  // Check if the POST request came from the 'Work' list form.
  if (req.body.list === "Work") {
    // If it is from 'Work', add the item to the workItems array.
    workItems.push(item);
    // Redirect to the '/work' route which will trigger the GET handler for that route.
    res.redirect("/work");
  } else {
    // If it is from the main list, add the item to the items array.
    items.push(item);
    // Redirect back to the root route, which will trigger the GET handler for the root route.
    res.redirect("/");
  }
});

app.post("/submit-name", function (req, res) {
  // Retrieve the new item from the form input named 'newItem' (from the body of the POST request).
  userName = req.body.userName;


  res.redirect("/");
}
);
// Define a GET route handler for the '/work' route.
app.get("/work", function (req, res) {
  // Render the 'list' template with 'Work List' as the title and the workItems array for the list items.
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

// Define a GET route handler for the '/about' route.
app.get("/about", function (req, res) {
  // Render the 'about' template. No data is passed to the 'about' template.
  res.render("about");
});

// Start the server on port 3000 and log a message to the console once the server is running.
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
