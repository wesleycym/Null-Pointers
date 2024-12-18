import { getDb } from '../mongo.js';
import bcrypt from 'bcrypt';
import express from 'express';
const router = express.Router();
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Buffer } = require('node:buffer');
import cookieParser from 'cookie-parser';


global.timeUpdate = new Map();
global.usernamesTest = new Map();

export function returnUsernamesTest() {
	return usernamesTest
}
export function returnTimeUpdate() {
	return timeUpdate
}

function updateCounter() {
	global.timeUpdate.forEach((value, key) => {
		let i = global.usernamesTest.get(key)
		if (i == 'ACTIVE') {
			let newval = value + 1
			global.timeUpdate.set(key, newval)
		} else {
			let newval = value - 1
			global.timeUpdate.set(key, newval)
		}
	});
}

const counterInterval = setInterval(updateCounter, 1000);

router.get('/active-users', (req, res) => {
	const activeUsers = [];
	global.usernamesTest.forEach((status, username) => {
		if (status === 'ACTIVE') {
			const timeActive = global.timeUpdate.get(username) || 0;
			activeUsers.push({ username, timeActive });
		}
	});

	// Send active users as a JSON response
	res.status(200).json(activeUsers);
});




router.get('/identity', async (req, res) => {
	console.log('identity');
	const token = req.cookies.auth;

	if (!token) {
		return res.status(401).json({ error: 'Not authenticated' });
	}

	try {
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
			return res.status(401).json({ error: 'Invalid token' });
		}

		console.log(authDoc);

		return res.status(200).json({
			username: authDoc.user,
		});
	} catch (error) {
		console.error('Error fetching user identity:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
});

router.route('/register').post(async (req, res) => {
	const { username, password1, password2 } = req.body;
	let data = req.body;
	let val = data.username;
	let val1 = data.password1;
	let val2 = data.password2;

	//checking passwords match
	//must be at least 8 characters long with one capital one lowercase and 1 number
	if (val != null && val1 != null && val2 != null) {
		console.log('here');
		if (val1 == val2) {
			let length = val1.length;
			let upper = false;
			let lower = false;
			let number = false;
			for (let i = 0; i < length; i++) {
				let letter = val1[i];
				if (
					letter == '0' ||
					letter == '1' ||
					letter == '2' ||
					letter == '3' ||
					letter == '4' ||
					letter == '5' ||
					letter == '6' ||
					letter == '7' ||
					letter == '8' ||
					letter == '9' ||
					letter == '10'
				) {
					number = true;
				} else {
					if (letter.toUpperCase() === letter) {
						upper = true;
					} else {
						lower = true;
					}
				}
			}
			if (length > 8) {
				if (upper == true) {
					if (lower == true) {
						if (number == true) {
							let taken = false;

							const db = await getDb('cse312');
							const collection = db.collection('users');
							const findResult = collection.find({
								username: username,
							});
							//checks if theres a document in database with the username the new user wants
							for await (const doc of findResult) {
								taken = true;
							}
							//if the username is free add to the database
							if (taken == false) {
								const salt = await bcrypt.genSalt();
								const hashedPassword = await bcrypt.hash(password1, salt);
								const doc = {
									username: username,
									password: hashedPassword,
									salt: salt,
								};
								const result = await collection.insertOne(doc);
							}
						}
					}
				}
			}
		}
	}
	res
		.status(302)
		.header({
			Location: '/',
			'X-Content-Type-Options': 'nosniff',
		})
		.end();
});

router.use(cookieParser());
router.route('/login').post(async (req, res) => {
	const { username, password } = req.body;
	const db = await getDb('cse312');

	//finding document with given username
	const collection = db.collection('users');
	const findResult = collection.find({
		username: username,
	});

	const allValues = [];
	for await (const doc of findResult) {
		allValues.push(doc.username, doc.password, doc.salt);
	}
	//if username is in database
	if (allValues.length != 0) {
		global.usernamesTest.set(username, "ACTIVE")
		global.timeUpdate.set(username, 1)

		//checking if passwords match from database and front end.
		const isMatch = await bcrypt.compare(password, allValues[1]);
		if (isMatch) {
			const authcollection = db.collection('auth');

			//generates new auth token
			const chars =
				'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
			const randomArray = Array.from(
				{ length: 15 },
				(v, k) => chars[Math.floor(Math.random() * chars.length)]
			);

			const authtoken = randomArray.join('');
			//sets new authtoken cookie
			res.cookie('auth', authtoken, {
				maxAge: 60 * 60 * 1000,
				httpOnly: true,
				secure: false,
			});

			const salt2 = await bcrypt.genSalt();
			const hashedtoken = await bcrypt.hash(authtoken, salt2);

			const auth = {
				user: allValues[0],
				authtoken: hashedtoken,
				salt: salt2,
			};
			const collection2 = db.collection('auth');
			const old2 = {
				user: allValues[0],
			};
			//deletes old auth token and inputs new one into database
			const deleteResult2 = await collection2.deleteMany(old2);
			const result2 = await collection2.insertOne(auth);

			res
				.status(302)
				.header({
					Location: '/homepage',
					'X-Content-Type-Options': 'nosniff',
				})
				.end();
		} else {
			res
				.status(302)
				.header({
					Location: '/',
					'X-Content-Type-Options': 'nosniff',
				})
				.end();
		}
	} else {
		res
			.status(302)
			.header({
				Location: '/',
				'X-Content-Type-Options': 'nosniff',
			})
			.end();
	}
});

//what i have so far for writting file
//correctly changes text but won't actually write to webpage

/*const path = require('path');
  readFile(path.join('public', 'index.html'), (err, data) => {
	if (err) {
		return res.status(500).send('Error reading file');
	}

	const newer =  Buffer.from(data).toString('ascii');
	const updatedHtml = newer.replace(/<input id="username" value= "{{username}}" name="username" hidden>/g, '<input id="username" value="'+ username+'" name="username">')
	console.log("this is updated html", updatedHtml)
	});*/

router.route('/logout').post(async (req, res) => {
	const authToken = req.cookies.auth;
	const db = await getDb('cse312');
	const authCollection = db.collection('auth');
	const authDocs = await authCollection.find({}).toArray();
	if (authToken && authDocs.length > 0) {
		const authDoc = authDocs.find((doc) =>
			bcrypt.compareSync(authToken, doc.authtoken)
		);

		if (authDoc) {
			await authCollection.deleteOne({ _id: authDoc._id });
			let username = authDoc.user
			timeUpdate.set(username, 0)
			global.usernamesTest.set(username, "OFFLINE")
			console.log("these are the users: ", global.usernamesTest)
		}

	}

	res.clearCookie('auth');

	res
		.status(302)
		.header({
			Location: '/',
			'X-Content-Type-Options': 'nosniff',
		})
		.end();
});



export default router;
