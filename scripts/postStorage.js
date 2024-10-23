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

// Main Logic
// Feed --> Posts --> Post --> Comments, Likes

// createPost | Adds new post to posts collection.
async function createPost(author, message) 
{
    const collection = db.collection('posts');
    // Generate postID

    const postID = new ObjectId()
    // Add postID | Author | Message to the collection
    const doc = {
        username: author,
        message: message,
        postID: postID,
    };
    const result = await collection.insertOne(doc);
}

// getPost | Returns post with matching id.
async function getPost(id)
{
    const collection = db.collection('posts');
    const findResult = collection.find({
        postID: id,
      });

}

// deletePost | Deletes post with matching id.
async function deletePost(id) {
    const collection = db.collection('posts');
    const findResult = collection.find({
        postID: id,
      });
    const result = await collection.deleteOne(findResult);
}

// updatePost | Will find the post with matching id, then update the displayed post.
async function updatePost(id, author, message) {
    const collection = db.collection('posts');
    const findResult = collection.find({
        postID: id,
      });
      const result1 = await collection.deleteOne(findResult);
    const doc = {
        username: author,
        message: message,
        postID: postID,
    };
    const result = await collection.insertOne(doc);
}

// createComment | Adds new comment to comments collection.
async function createComment(author, message) {
    const collection = db.collection('comments');
    // Generate postID

    const commentID = new ObjectId()
    // Add postID | Author | Message to the collection
    const doc = {
        username: author,
        message: message,
        commentID: commentID,
    };
    const result = await collection.insertOne(doc);

}

// getComment | Returns comment with matching id.
async function getComment(id)
{
    const collection = db.collection('comments');
    const findResult = collection.find({
        commentID: id,
      });

}

// deleteComment | Deletes comment with matching id.
async function deleteComment(author, message) {
    const collection = db.collection('posts');
    const findResult = collection.find({
        commentID: id,
      });
    const result = await collection.deleteOne(findResult);
    
}

// updateComment | Will find the comment with matching id, then update the displayed comment.
async function updateComments(id, username, comment) {const collection = db.collection('posts');
    const findResult = collection.find({
        commentID: id,
      });
      const result1 = await collection.deleteOne(findResult);
    const doc = {
        username: author,
        message: message,
        commentID: postID,
    };
    const result = await collection.insertOne(doc);}

async function updateLikes(id) {} // Don't worry abt this