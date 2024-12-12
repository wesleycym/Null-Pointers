import { WebSocketServer, WebSocket } from 'ws';
import { getDb } from '../mongo.js';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

const clients = new Map();

async function initWS(server) {
	console.log('Initializing WebSocket server...');

	const wss = new WebSocketServer({
		server,
		path: '/websocket',
		clientTracking: true
	});

	console.log('WebSocket server created with path:', wss.options.path);

	wss.on('headers', (headers, request) => {
		console.log('WebSocket headers:', headers);
	});

	wss.on('connection', async (ws, req) => {
		console.log('New WebSocket connection established');
		let username = 'guest';

		// Extract cookies from headers
		const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
			const [key, value] = cookie.trim().split('=');
			acc[key] = value;
			return acc;
		}, {});

		const authToken = cookies?.auth;
		if (authToken) {
			try {
				const db = await getDb('cse312');
				const authCollection = db.collection('auth');
				const authDocs = await authCollection.find({}).toArray();
				const authDoc = authDocs.find((doc) =>
					bcrypt.compareSync(authToken, doc.authtoken)
				);

				if (authDoc) {
					username = authDoc.user.toLowerCase();
				}
			} catch (error) {
				console.error('Error authenticating user:', error);
			}
		}

		clients.set(ws, username);
		console.log(`User ${username} connected`);

		ws.on('message', async (message) => {
			try {
				console.log(`Received message from ${username}: ${message}`);
				const data = JSON.parse(message);

				if (data.type === 'direct_message') {
					await handleDM(ws, username, data);
				} else {
					console.warn('Unhandled message type:', data.type);
				}
			} catch (error) {
				console.error('Error processing WebSocket message:', error);
			}
		});

		ws.on('close', () => {
			console.log(`User ${username} disconnected`);
			clients.delete(ws);
		});
	});

	wss.on('error', (error) => {
		console.error('WebSocket Server Error:', error);
	});

	console.log('WebSocket server initialized');
	return wss;
}

async function handleDM(ws, senderUsername, data) {
	const { recipient, message } = data;

	if (!recipient || !message) {
		console.error('Recipient or message is missing');
		return;
	}

	const normalizedRecipient = recipient.toLowerCase();
	const normalizedSender = senderUsername.toLowerCase();

	const payload = {
		sender: normalizedSender,
		recipient: normalizedRecipient,
		message,
		messageID: new ObjectId(),
		timestamp: new Date()
	};

	try {
		const db = await getDb('cse312');
		const messagesCollection = db.collection('messages');
		await messagesCollection.insertOne(payload);

		for (const [client, username] of clients.entries()) {
			const normalizedUsername = username.toLowerCase();
			console.log(`Checking client with username: ${normalizedUsername}`);

			if (
				(normalizedUsername === normalizedRecipient ||
					normalizedUsername === normalizedSender) &&
				client.readyState === WebSocket.OPEN
			) {
				console.log(`Sending message to ${username}`);
				client.send(
					JSON.stringify({
						type: 'direct_message',
						sender: senderUsername,
						message,
						timestamp: payload.timestamp
					})
				);
			}
		}
	} catch (error) {
		console.error('Error handling direct message:', error);
	}
}

export { initWS };
