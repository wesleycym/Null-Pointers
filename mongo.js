import { MongoClient } from 'mongodb';

// USAGE:
// import { getDb } from './mongo.js';
// const db = await getDb('cse312');
// const collection = db.collection('users');

export async function connectToCluster() {
	let mongoClient;

	try {
		const username = process.env.MONGO_USER;
		const password = process.env.MONGO_PASSWORD;
		
		if (!username || !password) {
		  console.error('MongoDB credentials are missing!');
		  process.exit(1);
		}
		
		const connectionString = `mongodb://${username}:${encodeURIComponent(password)}@mongo:27017/admin`;
		mongoClient = new MongoClient(connectionString);
		console.log('Connecting to MongoDB...');
		await mongoClient.connect();
		console.log('Successfully connected to MongoDB.');

		return mongoClient;
	} catch (error) {
		console.error('Connection to MongoDB failed.', error);
		process.exit();
	}
}

export async function getDb(dbName) {
	const mongoClient = await connectToCluster();

	return mongoClient.db(dbName);
}
