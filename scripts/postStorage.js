/*

MongoDB Storage (Idea)

id (int) | PostID - (str) | Author - (str) | Message- (str) | Likes - (int) | 
Comments - (idk bruh)

*/

// Imports
import { getDb } from './mongo.js'; // import getDb from mongo.js

// Global Variables
const db = await getDb('cse312'); // connect to cse312
const collection = db.collection('posts'); // Create posts collection

// Main Logic
// Feed --> Posts --> Post --> Comments, Likes

/*

Create functions:

- createPost
    - Adds new post to posts collection.
    - Generate postID and return it

- getPost
    - Returns post with matching postID.

- deletePost
    - Deletes post with matching postID.

- updatePost
    - Will find the post with matching postID.
    - Expects id, author, message
    - Mainly for editing the post

- addComment
    - Will find the post with matching postID.
    - Expects username (str), and comment (str)

- deleteComment
    - Will find the post with matching postID.
    - Will just remove the comment with matching username -> will need to change the way comments are stored

- updateLikes
    - Will find the post with matching postID.
    - Will just increment the likes with matching postID by 1

*/

function createPost(author, message) {}

function getPost(id) {}

function deletePost(id) {}

function updatePost(id, author, message) {}

function updateComments(id, username, comment) {}

function updateLikes(id) {} // Don't worry abt this