import express from 'express';
import path from 'path';
import bcrypt from 'bcrypt';
import { getDb } from './mongo.js';
import cookieParser from 'cookie-parser';
import { createRequire } from 'module';
import { initWS } from './sockets/serverWebsocket.js';
import { createServer as createHttpsServer } from 'https';
import { createServer as createHttpServer } from 'http';
import fs from 'fs';
import authRouter from './routes/auth.js';
import postRouter from './routes/posts.js';

const require = createRequire(import.meta.url);
const app = express();
const port = process.env.PORT || 8080;
const nodeEnv = process.env.NODE_ENV || 'development';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
	express.static('public', {
		setHeaders: (res) => {
			res.set('X-Content-Type-Options', 'nosniff');
		}
	})
);

// HTTPS redirect in production
if (nodeEnv === 'production') {
	app.use((req, res, next) => {
		if (!req.secure) {
			return res.redirect(`https://${req.headers.host}${req.url}`);
		}
		next();
	});
}

// Create server first
let server;
if (nodeEnv === 'development') {
	server = createHttpServer(app);
} else {
	try {
		const certPath = '/etc/letsencrypt/live/lockin.social/cert.pem';
		const keyPath = '/etc/letsencrypt/live/lockin.social/privkey.pem';

		server = createHttpsServer(
			{
				cert: fs.readFileSync(certPath),
				key: fs.readFileSync(keyPath)
			},
			app
		);
	} catch (error) {
		console.error('Failed to load SSL certificates:', error);
		console.log('Falling back to HTTP server');
		server = createHttpServer(app);
	}
}

// Initialize WebSocket before routes
initWS(server);

// Routes
app.get('/', (req, res) => {
	return res
		.status(200)
		.header({
			'Content-Type': 'text/html',
			'X-Content-Type-Options': 'nosniff'
		})
		.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.get('/homepage', (req, res) => {
	return res
		.status(200)
		.header({
			'Content-Type': 'text/html',
			'X-Content-Type-Options': 'nosniff'
		})
		.sendFile(path.join(process.cwd(), 'public', 'homepage.html'));
});

app.use('/auth', authRouter);
app.use('/posts', postRouter);

// Chat Messages Endpoint
app.get('/chat-messages', async (req, res) => {
	try {
		const db = await getDb('cse312');
		const messages = await db
			.collection('messages')
			.find()
			.sort({ timestamp: 1 })
			.toArray();
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
		.header({
			'Content-Type': 'application/javascript',
			'X-Content-Type-Options': 'nosniff'
		})
		.sendFile(path.join(process.cwd(), 'scripts', filename));
});

// 404 handler (must be last)
app.use((req, res) => {
	return res
		.status(404)
		.header({
			'Content-Type': 'text/html',
			'X-Content-Type-Options': 'nosniff'
		})
		.sendFile(path.join(process.cwd(), 'public', '404.html'));
});

// Start server
server.listen(port, () => {
	const protocol = nodeEnv === 'production' ? 'HTTPS' : 'HTTP';
	console.log(`${protocol} Server running on port ${port} in ${nodeEnv} mode`);
});

// Error handling
server.on('error', (error) => {
	console.error('Server error:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
	console.log('SIGTERM signal received: closing server');
	server.close(() => {
		console.log('Server closed');
		process.exit(0);
	});
});
