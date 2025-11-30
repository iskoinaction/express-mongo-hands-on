// Import required modules
const AWS = require("aws-sdk"); // AWS SDK for interacting with DynamoDB and other AWS services
const express = require("express"); // Express for handling routes and HTTP methods
const bodyParser = require("body-parser"); // Body-parser for parsing incoming request bodies
const awsServerlessExpress = require("aws-serverless-express"); // Middleware to make Express compatible with Lambda

// Import date module (ensure this file exists and works as intended)
const date = require("./date.js");

// Initialize an Express application
const app = express();

// Configure EJS as the template engine
app.set("view engine", "ejs");

// Configure middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded data from POST requests
app.use(express.static("public")); // Serve static files like CSS, JS, and images from the 'public' folder

// Configure DynamoDB client
const dynamoDb = new AWS.DynamoDB.DocumentClient(); // Simplifies DynamoDB operations
const TABLE_NAME = "ToDoList"; // DynamoDB table name

// Route: GET "/" - Display the main to-do list
app.get("/", async (req, res) => {
    const day = date.getDate(); // Get the current date (custom module)

    try {
        // Fetch items from DynamoDB
        const params = { TableName: TABLE_NAME, FilterExpression: "listName = :listName", ExpressionAttributeValues: { ":listName": "Main" } };
        const data = await dynamoDb.scan(params).promise(); // Retrieve all items for the main list

        // Render the "list-map" template, passing the current day and the list of items
        res.render("list-map", { listTitle: day, newListItems: data.Items });
    } catch (err) {
        console.error("Error fetching items from DynamoDB:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Route: POST "/" - Add a new item to the to-do list
app.post("/", async (req, res) => {
    const itemText = req.body.newItem; // The new item text from the form
    const listName = req.body.listName || "Main"; // The list name, defaulting to "Main"
    const uid = Date.now().toString(); // Unique ID for the item

    // Define parameters for adding the item to DynamoDB
    const params = {
        TableName: TABLE_NAME,
        Item: { uid, text: itemText, listName }, // Each item includes a unique ID, text, and list name
    };

    try {
        // Add the item to DynamoDB
        await dynamoDb.put(params).promise();
        // Redirect back to the appropriate list
        res.redirect(listName === "Work" ? "/work" : "/");
    } catch (err) {
        console.error("Error adding item to DynamoDB:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Route: GET "/work" - Display the work to-do list
app.get("/work", async (req, res) => {
    try {
        // Fetch work items from DynamoDB
        const params = { TableName: TABLE_NAME, FilterExpression: "listName = :listName", ExpressionAttributeValues: { ":listName": "Work" } };
        const data = await dynamoDb.scan(params).promise(); // Retrieve all items for the work list

        // Render the "list-map" template with the "Work" list title and items
        res.render("list-map", { listTitle: "Work", newListItems: data.Items });
    } catch (err) {
        console.error("Error fetching work items from DynamoDB:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Route: POST "/delete" - Delete an item from the list
app.post("/delete", async (req, res) => {
    const uidToDelete = req.body.uid; // The unique ID of the item to delete
    const listName = req.body.listName || "Main"; // The list name, defaulting to "Main"

    // Define parameters for deleting the item from DynamoDB
    const params = {
        TableName: TABLE_NAME,
        Key: { uid: uidToDelete }, // The primary key to identify the item
    };

    try {
        // Delete the item from DynamoDB
        await dynamoDb.delete(params).promise();
        // Redirect back to the appropriate list
        res.redirect(listName === "Work" ? "/work" : "/");
    } catch (err) {
        console.error("Error deleting item from DynamoDB:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Route: GET "/about" - Display the "About" page
app.get("/about", (req, res) => {
    res.render("about"); // Render the "about" template
});

// Adapt the app for AWS Lambda
const server = awsServerlessExpress.createServer(app);
exports.handler = (event, context) => {
    awsServerlessExpress.proxy(server, event, context);
};
// :)

// The items and workItems maps are now stored in a DynamoDB table called ToDoList.
// Each item in DynamoDB has:
// uid: A unique identifier for the item.
//     text: The text of the item.
//         listName: Either "Main" or "Work" to differentiate lists.

// Integrated DynamoDB Operations:

// scan: To fetch all items for a specific list.
//     put: To add a new item.
//         delete: To remove an item by uid.

// Used aws-serverless-express to wrap the Express app into a Lambda-compatible handler.

// EJS templates are still used to render the lists dynamically, based on the data fetched from DynamoDB.


// // Deployment Steps
// Create the DynamoDB Table:

// Table name: ToDoList.
// Primary key: uid.
// Package and Deploy:

// Zip the code and dependencies:
// bash
// Copiar código
// npm install--production
// zip - r todolist.zip.
// Upload the zip file to AWS Lambda.
// API Gateway:

// Connect the Lambda function to an API Gateway.
// Deploy the API to get a public URL.
// Access the Application:

// Use the API Gateway URL to access the ToDoList app.
