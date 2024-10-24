/*

MongoDB Storage (Idea)

id (int) | Author - (str) | Message- (str) | Likes - (int) | 
Comments - (idk bruh)

*/

// Imports
import { getDb } from './mongo.js'; // import getDb from mongo.js

import { ObjectId } from 'mongodb'; // import ObjectId | For creating postID

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

export async function createPost(author, message) {
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
	console.log(result);
	return result;
}

export async function getPost(id) {
	const collection = db.collection('posts');
	const findResult = collection.find({
		postID: id,
	});
}

export async function getAllPosts() {
	const collection = db.collection('posts');
	const posts = await collection.find({}).toArray();
	return posts;
}

export async function deletePost(id) {
	const collection = db.collection('posts');
	const findResult = collection.find({
		postID: id,
	});
	const result = await collection.deleteOne(findResult);
}

export async function updatePost(id, author, message) {
	const collection = db.collection('posts');
	const findResult = collection.find({
		postID: id,
	});
	const result1 = await collection.deleteOne(findResult);
	const doc = {
		username: author,
		message: message,
		postID: id,
	};
	const result = await collection.insertOne(doc);
}

export async function createComment(postID, author, message) {
	const collection = db.collection('comments');

	const commentID = new ObjectId();
	const doc = {
		username: author,
		message: message,
		commentID: commentID,
		postID: postID,
	};
	const result = await collection.insertOne(doc);
	return result;
}

export async function getAllComments() {
	const collection = db.collection('comments');
	const comments = await collection.find({}).toArray();
	return comments;
}

export async function deleteComment(author, message) {
	const collection = db.collection('posts');
	const findResult = collection.find({
		commentID: id,
	});
	const result = await collection.deleteOne(findResult);
}

export async function updateComments(id, username, comment) {
	const collection = db.collection('posts');
	const findResult = collection.find({
		commentID: id,
	});
	const result1 = await collection.deleteOne(findResult);
	const doc = {
		username: username,
		message: comment,
		commentID: id,
	};
	const result = await collection.insertOne(doc);
}

export async function createLike(userID, postID, isLiked) {
	console.log('postid: ', postID);
	const collection = db.collection('likes');
	const doc = {
		userID: userID,
		postID: postID,
		isLiked: isLiked,
	};
	const result = await collection.insertOne(doc);
	return result.insertedId;
}

export async function updateLike(userID, postID) {
	console.log('postid: ', postID);
	const collection = db.collection('likes');
	const existingLike = await collection.findOne({
		userID: userID,
		postID: postID,
	});

	if (existingLike) {
		// Toggle the like status
		const updatedIsLiked = !existingLike.isLiked;
		await collection.updateOne(
			{ userID: userID, postID: postID },
			{ $set: { isLiked: updatedIsLiked } }
		);
		return updatedIsLiked;
	} else {
		// Create a new like if it doesn't exist
		await createLike(userID, postID, true);
		return true;
	}
}

export async function getLikesForPost(postID) {
	console.log('postid: ', postID);
	const collection = db.collection('likes');
	const likes = await collection
		.find({ postID: postID, isLiked: true })
		.toArray();

	return likes.length;
}
