// Create a new Map to store items
// A Map is a collection of key-value pairs, where keys can be of any data type
const items = new Map();

// Add some initial items to the Map using the 'set' method
// The first parameter is the key, and the second is the value
items.set('1', 'Buy Food'); // Key '1' with value 'Buy Food'
items.set('2', 'Cook Food'); // Key '2' with value 'Cook Food'
items.set('3', 'Eat Food'); // Key '3' with value 'Eat Food'

// Print the entire Map to the console to see its contents
console.log("Contents of the Map:", items);

// Convert the Map into an array of objects
// The 'Array.from()' method is used to create an array from an iterable, like a Map
// Each entry in the Map is a key-value pair, represented as [key, value]
// We use destructuring ([uid, text]) to create an array of objects with 'uid' and 'text' properties
const itemList = Array.from(items, ([uid, text]) => ({
    uid, // The key from the Map becomes 'uid'
    text // The value from the Map becomes 'text'
}));

// Print the resulting array of objects
console.log("Array of objects converted from Map:", itemList);

// Example usage of the array 'itemList':
// Loop through each item in the list and display the contents
itemList.forEach(item => {
    console.log(`Item UID: ${item.uid}, Text: ${item.text}`);
});

// You can also manipulate or filter this array if needed
// For example, filter items where the text includes 'Food'
const filteredItems = itemList.filter(item => item.text.includes('Food'));

// Print the filtered items
console.log("Filtered items (only those with 'Food' in the text):", filteredItems);
