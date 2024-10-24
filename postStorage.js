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
//const collection = db.collection('posts'); // Create posts collection

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

async function createPost(author, message) {
	const collection = db.collection('posts');
	// Generate postID

	const postID = new ObjectId();
	// Add postID | Author | Message to the collection
	const doc = {
		username: author,
		message: message,
		postID: postID,
	};
	const result = await collection.insertOne(doc);
}

async function getPost(id) {
	const collection = db.collection('posts');
	const findResult = collection.find({
		postID: id,
	});
}

async function deletePost(id) {
	const collection = db.collection('posts');
	const findResult = collection.find({
		postID: id,
	});
	const result = await collection.deleteOne(findResult);
}

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
async function createComment(author, message) {
	const collection = db.collection('comments');
	// Generate postID

	const commentID = new ObjectId();
	// Add postID | Author | Message to the collection
	const doc = {
		username: author,
		message: message,
		commentID: commentID,
	};
	const result = await collection.insertOne(doc);
}
async function deleteComment(author, message) {
	const collection = db.collection('posts');
	const findResult = collection.find({
		commentID: id,
	});
	const result = await collection.deleteOne(findResult);
}

async function updateComments(id, username, comment) {
	const collection = db.collection('posts');
	const findResult = collection.find({
		commentID: id,
	});
	const result1 = await collection.deleteOne(findResult);
	const doc = {
		username: author,
		message: message,
		commentID: postID,
	};
	const result = await collection.insertOne(doc);
}

async function updateLikes(id) {} // Don't worry abt this
