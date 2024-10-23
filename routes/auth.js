import { getDb } from '../mongo.js';
import bcrypt from 'bcrypt';
import express from 'express';
const router = express.Router();
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Buffer } = require('node:buffer');
import cookieParser from 'cookie-parser'


router.route('/register').post(async (req, res) => {
	
	const { username, password1, password2 } = req.body;
	let data = req.body;
	let val = data.username;
	let val1 = data.password1
	let val2 = data.password2

	//checking passwords match 
	//must be at least 8 characters long with one capital one lowercase and 1 number
	if((val!=null)&&(val1!=null)&&(val2!=null)){
		console.log("here")
	if(val1 == val2){
		let length = val1.length 
		let upper = false
		let lower = false
		let number = false
		for(let i =0; i< length; i++){
			let letter = val1[i]
			if((letter == '0')|| (letter == '1')||(letter == '2')||(letter == '3')||(letter == '4')||(letter == '5')||(letter == '6')||(letter == '7')||(letter == '8')||(letter == '9')||(letter == '10')){
				number = true
			}else{
				if (letter.toUpperCase() === letter) {
					upper = true
				}else{
					lower = true
				}
			}	
		}
		if(length > 8){
			if(upper == true){
				if(lower == true){
					if(number == true){
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
						  if(taken == false){
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
	}}

	res
		.status(302)
		.header({
			Location: '/',
			'X-Content-Type-Options': 'nosniff',
		})
		.end();

});

router.use(cookieParser()); 


router.route('/login').post(async(req, res) => {

	const {readFile, writeFile} = require('fs');
	const { username, password } = req.body;
	let data = req.body;
	let val = data.username;
	let val1 = data.password
	const db = await getDb('cse312');

	//finding document with given username
	const collection = db.collection('users');
	const findResult = collection.find({
		username: val,
		});
	
	const allValues = []
	for await (const doc of findResult) {
		allValues.push(doc.username, doc.password, doc.salt)
	}
	//if username is in database
	if(allValues.length != 0){

	//checking if passwords match from database and front end. 
	const hashedPassword = await bcrypt.hash(val1, allValues[2]);
	if(hashedPassword == allValues[1]){
		const authcollection = db.collection('auth');
		

		//getting authtoken based on username
		const authfind = authcollection.find({
			user: val,
			});
			const authValues = []
	
			for await (const doc of authfind) {
				authValues.push(doc.username, doc.authtoken, doc.salt)
			}

		//if auth token has already been generated for this user
		let hashedauth = ""
		if(authValues.length != 0){
			const authtokenfromfront = req.cookies.auth
			hashedauth = await bcrypt.hash(authtokenfromfront, authValues[2]);
		}

		
		if(hashedauth == authValues[1]){
			//this would be the place to make the auth token functionallity work i think 
			//only hesitation is writting to the html so need to handle that
			//that way the user never gets "logged in"""
			//otherwise this functionallity is meanigless
		}

	

		//generates new auth token 
		const chars =
		"AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
		const randomArray = Array.from(
		  { length: 15 },
		  (v, k) => chars[Math.floor(Math.random() * chars.length)]
		);
		
		const authtoken = randomArray.join("");		
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
		//<h3><i class="fas fa-user-circle"></i> User 1</h3>
		let updatedHtml = ""
		const path = require('path');
		//deletes old auth token and inputs new one into database
		const deleteResult2 = await collection2.deleteMany(old2);
		const result2 = await collection2.insertOne(auth);
		

		readFile(path.join('public', 'homepage.html'), (err, data) => {
			if (err) {
				return res.status(500).send('Error reading file');
			}
		
			const newer =  Buffer.from(data).toString('ascii');
			let user = allValues[0]
			updatedHtml = newer.replace('<li><a href="#"><i class="fas fa-user"></i> Profile</a></li>', '<li><a href="#"><i class="fas fa-user"></i> ' + user+' </a></li>');
			writeFile(path.join('public', 'homepage.html'), updatedHtml, 'utf8', (err) => {
				if (err) {
					return res.status(500).send('Error writing the file');
				}
			});
			});
	res
	.status(302)
	.header({
		Location: '/homepage',
		'X-Content-Type-Options': 'nosniff',
	})
	.end();
	
  }else{	res
	.status(302)
	.header({
		Location: '/',
		'X-Content-Type-Options': 'nosniff',
	})
	.end();
}}else{
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

router.route('/logout').post(async(req, res) => {
	const {readFile, writeFile} = require('fs');
	const authtokenfromfront = req.cookies.auth
	const path = require('path');
	const db = await getDb('cse312');
	const authcollection = db.collection('auth');
	let hashedauth = ""


		//getting authtoken based on username
	const authfind = authcollection.find({});
	let username = ""
	for await (const doc of authfind) {
		hashedauth = await bcrypt.hash(authtokenfromfront, doc.salt);
		if(hashedauth == doc.authtoken){
			username = doc.user
		}
	}

	readFile(path.join('public', 'homepage.html'), (err, data) => {
		if (err) {
			return res.status(500).send('Error reading file');
		}
	
		const newer =  Buffer.from(data).toString('ascii');
		let updatedHtml = newer.replace('<li><a href="#"><i class="fas fa-user"></i> ' + username+' </a></li>', '<li><a href="#"><i class="fas fa-user"></i> Profile</a></li>');
		writeFile(path.join('public', 'homepage.html'), updatedHtml, 'utf8', (err) => {
			if (err) {
				return res.status(500).send('Error writing the file');
			}
		});
		});
	//clears auth cookie 

	//would also need to reset html to original state clear username
	res.cookie('auth', "", {
		maxAge: 60 * 60 * 1000, 
		httpOnly: true, 
		secure: false, 
	});
	res
		.status(302)
		.header({
			Location: '/',
			'X-Content-Type-Options': 'nosniff',
		})
		.end();
});

export default router;
