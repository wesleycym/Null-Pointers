import { getDb } from '../mongo.js';
import bcrypt from 'bcrypt';
import express from 'express';
const router = express.Router();
import {
	createPost,
	getAllPosts,
	getLikesForPost,
	updateLike,
} from '../postStorage.js';

router.route('/').post(async (req, res) => {
	const { 'post-content': postContent, 'post-image': postImage } = req.body;

	if (!postContent) {
		return res.status(400).json({ error: 'Post content is required' });
	}
	// Get the currently logged in user from the auth cookie
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

	const user = authDoc.user;

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
	const db = await getDb('cse312');
	const authCollection = db.collection('auth');
	const authDocs = await authCollection.find({}).toArray();
	const authDoc = authDocs.find((doc) =>
		bcrypt.compareSync(authToken, doc.authtoken)
	);

	const updatedPosts = await Promise.all(
		posts.map(async (post) => {
			const likesCount = await getLikesForPost(post.postID.toString());
			const isLiked = authDoc
				? await getLikesForPost(post.postID.toString(), authDoc.user)
				: false;
			return { ...post, likes: likesCount, isLiked: isLiked };
		})
	);

	return res.status(200).json(updatedPosts);
});

router.route('/like').post(async (req, res) => {
	const { postID } = req.body;

	console.log(postID);

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

export default router;
