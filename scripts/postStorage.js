/*

MongoDB Storage (Idea)

id (int) | Author - (str) | Message- (str) | Likes - (int) | 
Comments - (idk bruh)

*/

// Imports
import { getDb } from './mongo.js'; // import getDb from mongo.js

const { ObjectId } = require('mongodb'); // import ObjectId | For creating postID

// Global Variables
const db = await getDb('cse312'); // connect to cse312
const collection = db.collection('posts'); // Create posts collection

// Main Logic
// Feed --> Posts --> Post --> Comments, Likes

/*

Create functions:

- createPost
    - Adds new post to posts collection.

- getPost
    - Returns post with matching id.

- deletePost
    - Deletes post with matching id.

- updatePost
    - Will find the post with matching id.
    - Expects id, author, message
    - Mainly for editing the post

- addComment
    - Will find the post with matching id.
    - Expects username (str), and comment (str)

- deleteComment
    - Will find the post with matching id.
    - Will just remove the comment with matching username -> will need to change the way comments are stored

- updateLikes
    - Will find the post with matching id.
    - Will just increment the likes with matching id by 1

*/

function createPost(author, message) 
{
    // Generate postID
    // Add postID | Author | Message to the collection

}

function getPost(id)
{

}

function deletePost(id) {}

function updatePost(id, author, message) {}

function updateComments(id, username, comment) {}

function updateLikes(id) {} // Don't worry abt this