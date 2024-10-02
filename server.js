import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 8080;
const nodeEnv = process.env.NODE_ENV || 'development';

import authRouter from './routes/auth.js';

app.use(express.json());

// static files
app.use(
	express.static('public', {
		setHeaders: (res) => {
			res.set('X-Content-Type-Options', 'nosniff');
		},
	})
);

// root route
app.get('/', (req, res) => {
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
