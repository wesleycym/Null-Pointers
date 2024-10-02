import { MongoClient } from 'mongodb';

// USAGE:
// import { getDb } from './mongo.js';
// const db = await getDb('cse312');
// const collection = db.collection('users');

export async function connectToCluster() {
	let mongoClient;

	try {
		mongoClient = new MongoClient('mongodb://mongo:27017');
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
