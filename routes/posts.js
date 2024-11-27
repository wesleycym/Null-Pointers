import { getDb } from '../mongo.js';
import bcrypt from 'bcrypt';
import express from 'express';
const router = express.Router();
import { v4 as uuidv4 } from 'uuid';  
import fs from 'fs';
import escapeHtml from 'escape-html';


import { ObjectId } from 'mongodb'; // import ObjectId | For creating postID

// Global Variables
const db = await getDb('cse312'); // connect to cse312
import {
	createPost,
	getAllPosts,
	getLikesForPost,
	updateLike,
	createComment,
	getAllComments,
} from '../postStorage.js';

const rawdata = (req) => {
	//gets full request keeping it in multipart/form-data so we can properly extract
	return new Promise((resolve, reject) => {
		let total = [];  
		req.on('data', (chunk) => {
		  total.push(chunk); 
		});
	  req.on('end', () => {
		req.rawBody = Buffer.concat(total);  
		resolve();  
	  });
  
	  req.on('error', (err) => {
		reject(err);  
	  });
	});
  };

router.route('/').post(async (req, res) => {
	//getting username
	const authToken = req.cookies.auth;
	let user = 'guest';
	let filePath = '';
	if (authToken) {
		const db = await getDb('cse312');
		const authCollection = db.collection('auth');
		const authDocs = await authCollection.find({}).toArray();
		const authDoc = authDocs.find((doc) =>
			bcrypt.compareSync(authToken, doc.authtoken)
		);

		if (authDoc) {
			user = authDoc.user;
		}
	}	
	
	//getting raw multipart request
	await rawdata(req);

	//spliting up the text
	const boundary = req.headers['content-type'].split('boundary=')[1];
	const middleboundary = "--"+ boundary
	const other = req.rawBody.slice(middleboundary.length);
	const end = other.indexOf(middleboundary);
	const temp = other.slice(0, end)
	const textstuff = 'Content-Disposition: form-data; name="post-content"'
	let t = temp.indexOf(textstuff);
	t = t + textstuff.length
	const text  = temp.slice(t)
	
	//spliting up the image
	const tempimage = other.slice(end+middleboundary.length)
	const splitone = Buffer.from('\r\n\r\n', 'utf-8');
	const splittwo = Buffer.from('\r\n--', 'utf-8');
	const start = tempimage.indexOf(splitone);
	const bodyStart = start + splitone.length;
	const body = tempimage.slice(bodyStart); 
	const starttwo = body.indexOf(splittwo);
	const image = body.slice(0, starttwo);

	//if there was an image and text
	if(image.length > 1){

		//creating new filename and writing it to disk
		const randomName = uuidv4();  
		filePath = './public/img/' + randomName + '.jpg';
		await fs.promises.writeFile(filePath, image);
		
		//adding it to database 
		const collection = db.collection('posts');
		const database = '/img/' + randomName + '.jpg';
		let tempmessage = escapeHtml(text);
		let message = '<div style="width: 240px; height: 300px; overflow: hidden;"><img src="'
		+ database + '"style="width: 100%; height: 100%; object-fit: contain;"></div>' + tempmessage;
		const postID = new ObjectId();
		const doc = {
			username: user,
			message: message,
			postID: postID,
		};
		collection.insertOne(doc);
		}

		else{ 

			//if there was only text
			if(text.length>1){
			let message = escapeHtml(text);
			const postID = new ObjectId();
			const doc = {
				username: user,
				message: message,
				postID: postID,
			};
			const collection = db.collection('posts');
			collection.insertOne(doc);
			}else{
				
				//no text or image
				return res.status(400).json({ error: 'Post content is required' });
			}
		}
	return res
		.status(302)
		.header({
			Location: '/homepage',
			'X-Content-Type-Options': 'nosniff',
		})
		.end();
});

router.route('/').get(async (req, res) => {
	const posts = await getAllPosts();
	const authToken = req.cookies.auth;
	let authDoc = null;
	if (authToken) {
		const db = await getDb('cse312');
		const authCollection = db.collection('auth');
		const authDocs = await authCollection.find({}).toArray();
		authDoc = authDocs.find((doc) =>
			bcrypt.compareSync(authToken, doc.authtoken)
		);
	}

	const updatedPosts = await Promise.all(
		posts.map(async (post) => {
			const user = authDoc ? authDoc.user : null;
			const likesCount = await getLikesForPost(post.postID.toString());
			const db = await getDb('cse312');
			const collection = db.collection('likes');
			const existingLike = await collection
				.find({ postID: post.postID.toString(), isLiked: true, userID: user })
				.toArray();
			const userLikesThisPost = existingLike.length > 0;

			return { ...post, likes: likesCount, isLiked: userLikesThisPost };
		})
	);

	return res.status(200).json(updatedPosts);
});

router.route('/like').post(async (req, res) => {
	const { postID } = req.body;

	const authToken = req.cookies.auth;
	if (!authToken) {
		return res.status(401).json({ error: 'User not authenticated' });
	}

	const db = await getDb('cse312');
	const authCollection = db.collection('auth');
	const authDocs = await authCollection.find({}).toArray();
	const authDoc = authDocs.find((doc) =>
		bcrypt.compareSync(authToken, doc.authtoken)
	);

	if (!authDoc) {
		return res.status(401).json({ error: 'Invalid authentication token' });
	}

	const userID = authDoc.user;

	await updateLike(userID, postID);
	return res.status(200).json({ message: 'Like updated' });
});

router.route('/comment').post(async (req, res) => {
	const { postID, commenter, comment } = req.body;

	const authToken = req.cookies.auth;

	let authDoc = null;
	if (authToken) {
		const db = await getDb('cse312');
		const authCollection = db.collection('auth');
		const authDocs = await authCollection.find({}).toArray();
		authDoc = authDocs.find((doc) =>
			bcrypt.compareSync(authToken, doc.authtoken)
		);
	}

	const user = authToken ? authDoc?.user : 'guest'; // Default to guest if not logged in

	await createComment(postID, user || commenter, comment);
	return res
		.status(302)
		.header({
			Location: '/homepage',
			'X-Content-Type-Options': 'nosniff',
		})
		.end();
});

router.route('/comments').get(async (req, res) => {
	const comments = await getAllComments();
	return res.status(200).json(comments);
});

export default router;
