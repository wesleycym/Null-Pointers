import { getDb } from '../mongo.js';
import bcrypt from 'bcrypt';
import express from 'express';
const router = express.Router();
import {
	createPost,
	getAllPosts,
	getLikesForPost,
	updateLike,
	createComment,
	getAllComments,
} from '../postStorage.js';

router.route('/').post(async (req, res) => {
	const { 'post-content': postContent, 'post-image': postImage } = req.body;

	if (!postContent) {
		return res.status(400).json({ error: 'Post content is required' });
	}
	// Get the currently logged in user from the auth cookie
	const authToken = req.cookies.auth;
	let user = 'guest'; // Default to guest if not logged in
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

	await createPost(user, postContent, postImage);

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
