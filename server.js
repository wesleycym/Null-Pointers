import express from 'express';
import path from 'path';
import bcrypt from 'bcrypt';
import { getDb } from './mongo.js';
import cookieParser from 'cookie-parser';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Buffer } = require('node:buffer');
const app = express();
const port = process.env.PORT || 8080;
const nodeEnv = process.env.NODE_ENV || 'development';

import authRouter from './routes/auth.js';
import postRouter from './routes/posts.js';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
// static files
app.use(
	express.static('public', {
		setHeaders: (res) => {
			res.set('X-Content-Type-Options', 'nosniff');
		},
	})
);

// root route
app.get('/', async (req, res) => {
	return res
		.status(200)
		.header({
			'Content-Type': 'text/html',
			'X-Content-Type-Options': 'nosniff',
		})
		.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Routes
app.use('/auth', authRouter);
// testing how routing works
app.get('/homepage', (req, res) => {
	return res
		.status(200)
		.header({
			'Content-Type': 'text/html',
			'X-Content-Type-Options': 'nosniff',
		})
		.sendFile(path.join(process.cwd(), 'public', 'homepage.html'));
});

// Return 404 for all other requests
app.get('/homepage', async (req, res) => {
	return res
		.status(200)
		.header({
			'Content-Type': 'text/html',
			'X-Content-Type-Options': 'nosniff',
		})
		.sendFile(path.join(process.cwd(), 'public', 'homepage.html'));
});

// posts
app.use('/posts', postRouter);

app.post('/post-path', (req, res) => {
	console.log(req.body);
	return res.status(200).json({ message: 'Post received!' });
});

// Return 404 for all other requests
app.use((req, res) => {
	return res
		.status(404)
		.header({
			'Content-Type': 'text/html',
			'X-Content-Type-Options': 'nosniff',
		})
		.sendFile(path.join(process.cwd(), 'public', '404.html'));
});

app.listen(port, () => {
	console.log(`Server running on port ${port} in ${nodeEnv} mode`);
});
