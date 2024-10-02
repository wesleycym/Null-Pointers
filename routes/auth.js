import express from 'express';
const router = express.Router();

router.route('/register').post(async (req, res) => {
	const { username, password } = req.body;

	res
		.status(302)
		.header({
			Location: '/',
			'X-Content-Type-Options': 'nosniff',
		})
		.end();
});

router.route('/login').post((req, res) => {
	const { username, password } = req.body;

	res
		.status(302)
		.header({
			Location: '/',
			'X-Content-Type-Options': 'nosniff',
		})
		.end();
});

router.route('/logout').post((req, res) => {
	res
		.status(302)
		.header({
			Location: '/',
			'X-Content-Type-Options': 'nosniff',
		})
		.end();
});

export default router;
