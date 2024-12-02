
import express from 'express';
import path from 'path';
import bcrypt from 'bcrypt';
import { getDb } from './mongo.js';
import cookieParser from 'cookie-parser';
import { createRequire } from 'module';
import { initWS } from './sockets/serverWebsocket.js';
import { createServer } from 'http';

const require = createRequire(import.meta.url);
const app = express();
const port = process.env.PORT || 8080;
const nodeEnv = process.env.NODE_ENV || 'development';

import authRouter from './routes/auth.js';
import postRouter from './routes/posts.js';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve Static Files
app.use(
	express.static('public', {
		setHeaders: (res) => {
			res.set('X-Content-Type-Options', 'nosniff');
		},
	})
);

// Routes
app.get('/', (req, res) => {
	return res
		.status(200)
		.header({ 'Content-Type': 'text/html', 'X-Content-Type-Options': 'nosniff' })
		.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.get('/homepage', (req, res) => {
	return res
		.status(200)
		.header({ 'Content-Type': 'text/html', 'X-Content-Type-Options': 'nosniff' })
		.sendFile(path.join(process.cwd(), 'public', 'homepage.html'));
});

app.use('/auth', authRouter);
app.use('/posts', postRouter);

// Chat Messages Endpoint
app.get('/chat-messages', async (req, res) => {
	try {
		const db = await getDb('cse312');
		const messages = await db.collection('messages').find().sort({ timestamp: 1 }).toArray();
		res.status(200).json(messages);
	} catch (error) {
		console.error('Error fetching chat messages:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.get('/scripts/:filename', (req, res) => {
	const filename = req.params.filename;
	return res
		.status(200)
		.header({ 'Content-Type': 'application/javascript', 'X-Content-Type-Options': 'nosniff' })
		.sendFile(path.join(process.cwd(), 'scripts', filename));
});

// 404 Handler (Place this last)
app.use((req, res) => {
	return res
		.status(404)
		.header({ 'Content-Type': 'text/html', 'X-Content-Type-Options': 'nosniff' })
		.sendFile(path.join(process.cwd(), 'public', '404.html'));
});

// Create HTTP Server
const httpServer = createServer(app);

// Initialize WebSocket Server
initWS(httpServer);

// Start the Server
httpServer.listen(port, () => {
	console.log(`Server running on port ${port} in ${nodeEnv} mode`);
});





// import express from 'express';
// import path from 'path';
// import bcrypt from 'bcrypt';
// import { getDb } from './mongo.js';
// import cookieParser from 'cookie-parser';
// import { createRequire } from 'module';
// import { initWS } from './sockets/serverWebsocket.js';
// const require = createRequire(import.meta.url);
// const { Buffer } = require('node:buffer');
// const app = express();
// const port = process.env.PORT || 8080;
// const nodeEnv = process.env.NODE_ENV || 'development';

// import authRouter from './routes/auth.js';
// import postRouter from './routes/posts.js';

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(cookieParser());
// // static files
// app.use(
// 	express.static('public', {
// 		setHeaders: (res) => {
// 			res.set('X-Content-Type-Options', 'nosniff');
// 		},
// 	})
// );

// // root route
// app.get('/', async (req, res) => {
// 	return res
// 		.status(200)
// 		.header({
// 			'Content-Type': 'text/html',
// 			'X-Content-Type-Options': 'nosniff',
// 		})
// 		.sendFile(path.join(process.cwd(), 'public', 'index.html'));
// });

// // Routes
// app.use('/auth', authRouter);
// // testing how routing works
// app.get('/homepage', (req, res) => {
// 	return res
// 		.status(200)
// 		.header({
// 			'Content-Type': 'text/html',
// 			'X-Content-Type-Options': 'nosniff',
// 		})
// 		.sendFile(path.join(process.cwd(), 'public', 'homepage.html'));
// });

// // Return 404 for all other requests
// app.get('/homepage', async (req, res) => {
// 	return res
// 		.status(200)
// 		.header({
// 			'Content-Type': 'text/html',
// 			'X-Content-Type-Options': 'nosniff',
// 		})
// 		.sendFile(path.join(process.cwd(), 'public', 'homepage.html'));
// });

// // posts
// app.use('/posts', postRouter);

// app.post('/post-path', (req, res) => {
// 	console.log(req.body);
// 	return res.status(200).json({ message: 'Post received!' });
// });

// // Return 404 for all other requests
// app.use((req, res) => {
// 	return res
// 		.status(404)
// 		.header({
// 			'Content-Type': 'text/html',
// 			'X-Content-Type-Options': 'nosniff',
// 		})
// 		.sendFile(path.join(process.cwd(), 'public', '404.html'));
// });

// app.get('/chat-messages', async (req, res) => {
// 	try {
// 		const db = await getDb('cse312');
// 		const messages = await db.collection('messages').find().sort({ timestamp: 1 }).toArray();
// 		res.status(200).json(messages);
// 	} catch (error) {
// 		console.error('Error fetching chat messages:', error);
// 		res.status(500).json({ error: 'Internal server error' });
// 	}
// });


// // Create HTTP server
// const httpServer = createServer(app);

// // Initialize WebSocket server
// initWS(httpServer);

// // Start the server
// httpServer.listen(port, () => {
// 	console.log(`Server running on port ${port}`);
// });









// app.listen(port, () => {
// 	console.log(`Server running on port ${port} in ${nodeEnv} mode`);
// });
