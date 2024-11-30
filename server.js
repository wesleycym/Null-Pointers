import express from 'express';
import path from 'path';
import { createRequire } from 'module';
import { createServer } from 'http';
import { initializeWebSocketServer } from './websockets.js'; // Import WebSocket server
import cookieParser from 'cookie-parser';
import { getDb } from './mongo.js';
import authRouter from './routes/auth.js';
import postRouter from './routes/posts.js';

const require = createRequire(import.meta.url);
const app = express();
const port = process.env.PORT || 8080;
const nodeEnv = process.env.NODE_ENV || 'development';

// MongoDB connection (reuse this connection throughout)
const db = await getDb('cse312');
const messagesCollection = db.collection('messages');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use(
	express.static('public', {
		setHeaders: (res) => {
			res.set('X-Content-Type-Options', 'nosniff');
		},
	})
);

// Routes
app.get('/', (req, res) => {
	res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});
app.use('/auth', authRouter);
app.use('/posts', postRouter);
app.get('/homepage', (req, res) => {
	res.sendFile(path.join(process.cwd(), 'public', 'homepage.html'));
});
app.use((req, res) => {
	res.status(404).sendFile(path.join(process.cwd(), 'public', '404.html'));
});

// Chat history endpoint
app.get('/chat-messages', async (req, res) => {
	try {
		const messages = await messagesCollection.find().sort({ timestamp: 1 }).toArray();
		res.status(200).json(messages);
	} catch (error) {
		console.error('Error fetching chat history:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket server
await initializeWebSocketServer(httpServer);

// Start the server
httpServer.listen(port, () => {
	console.log(`Server running on http://0.0.0.0:${port} in ${nodeEnv} mode`);
});




// import express from 'express';
// import path from 'path';
// import bcrypt from 'bcrypt';
// import { getDb } from './mongo.js';
// import cookieParser from 'cookie-parser';
// import { createRequire } from 'module';
// import { WebSocketServer } from 'ws';
// import { createServer } from 'http';

// import { initializeWebSocketServer } from './websockets.js';

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

// app.listen(port, () => {
// 	console.log(`Server running on port ${port} in ${nodeEnv} mode`);
// });


// //  Web sockets
// app.get('/chat-history', async (req, res) => {
// 	try {
// 		const db = await getDb('cse312');
// 		const messagesCollection = db.collection('messages');
// 		const messages = await messagesCollection.find().sort({ timestamp: 1 }).toArray();
// 		res.status(200).json(messages);
// 	} catch (error) {
// 		console.error('Error fetching chat history:', error);
// 		res.status(500).json({ error: 'Internal server error' });
// 	}
// });




// //Create HTTP server
// const httpServer = createServer(app);

// // Initialize WebSocket server
// await initializeWebSocketServer(httpServer);

// // Start the server
// httpServer.listen(port, () => {
// 	console.log(`Server running on port ${port}`);
// });
//const connections = new Map(); // Store authenticated connections



//WebSocket Server
// const wss = new WebSocketServer({ server: httpServer, path: '/websocket' });

// wss.on('connection', (ws, req) => {
// 	// Authenticate the user during the WebSocket handshake
// 	const cookies = cookie.parse(req.headers.cookie || '');
// 	const token = cookies.authToken; // Use your auth token cookie name

// 	let username = 'Guest';
// 	if (token) {
// 		try {
// 			const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace JWT_SECRET with your secret
// 			username = decoded.username || 'Guest';
// 		} catch (error) {
// 			console.error('Invalid token:', error.message);
// 		}
// 	}

// 	console.log(`User connected: ${username}`);

// 	// Add connection to the map
// 	connections.set(ws, username);

// 	// Handle incoming messages
// 	ws.on('message', async (data) => {
// 		handleWebSocketMessage(ws, data, username);
// 	});

// 	// Handle disconnection
// 	ws.on('close', () => {
// 		connections.delete(ws);
// 		console.log(`User disconnected: ${username}`);
// 	});
// });

// function handleWebSocketMessage(ws, data, username) {
// 	try {
// 		const frame = JSON.parse(data);
// 		if (frame.messageType === 'chatMessage') {
// 			broadcastMessage(ws, username, frame.message);
// 		}
// 	} catch (error) {
// 		console.error('Error handling WebSocket message:', error);
// 	}
// }

// function broadcastMessage(ws, username, message) {
// 	const escapedMessage = escapeHtml(message);
// 	const messagePayload = {
// 		messageType: 'chatMessage',
// 		username,
// 		message: escapedMessage,
// 		id: Date.now().toString(), // Unique ID for each message
// 	};

// 	// Send to all connected clients
// 	for (const [client, clientUsername] of connections.entries()) {
// 		if (client.readyState === WebSocket.OPEN) {
// 			client.send(JSON.stringify(messagePayload));
// 		}
// 	}

// 	// Save to database
// 	saveMessageToDatabase(messagePayload);
// }

// async function saveMessageToDatabase(messagePayload) {
// 	try {
// 		const db = await getDb('cse312');
// 		const messagesCollection = db.collection('messages');
// 		await messagesCollection.insertOne(messagePayload);
// 	} catch (error) {
// 		console.error('Error saving message to database:', error);
// 	}
// }





//Create HTTP server
// const httpServer = createServer(app);

// // Initialize WebSocket server
// await initializeWebSocketServer(httpServer);

// // Start the server
// httpServer.listen(port, () => {
// 	console.log(`Server running on port ${port}`);
// });