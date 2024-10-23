/*

MongoDB Storage (Idea)

id (int) | PostID - (str) | Author - (str) | Likes - (int) | Comments - ({user1-> [comment1, comment2], user2-> [comment3]})

*/

// Imports
import { getDb } from './mongo.js'; // import getDb from mongo.js

// Global Variables
const db = await getDb('cse312'); // connect to cse312
const collection = db.collection('posts'); // Create posts collection

// Main Logic