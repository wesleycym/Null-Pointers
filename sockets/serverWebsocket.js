import { WebSocketServer } from 'ws';
import { getDb } from '../mongo.js';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

const clients = new Map();

async function initWS(server) {
    const wss = new WebSocketServer({ server, path: '/websocket' });

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

    console.log('WebSocket server initialized');
}

async function handleDM(ws, senderUsername, data) {
    const { recipient, message } = data;

    if (!recipient || !message) {
        console.error('Recipient or message is missing');
        return;
    }

    // Normalize usernames to ensure consistency
    const normalizedRecipient = recipient.toLowerCase();
    const normalizedSender = senderUsername.toLowerCase();

    const payload = {
        sender: normalizedSender,
        recipient: normalizedRecipient,
        message,
        messageID: new ObjectId(),
        timestamp: new Date(),
    };

    try {
        // Save the message to the database
        const db = await getDb('cse312');
        const messagesCollection = db.collection('messages');
        await messagesCollection.insertOne(payload);

        // Send the message to both the recipient and the sender
        for (const [client, username] of clients.entries()) {
            const normalizedUsername = username.toLowerCase();
            if (
                (normalizedUsername === normalizedRecipient ||
                normalizedUsername === normalizedSender) &&
                client.readyState === WebSocket.OPEN
            ) {
                client.send(
                    JSON.stringify({
                        type: 'direct_message',
                        sender: senderUsername, // Use original case for display
                        message,
                        timestamp: payload.timestamp,
                    })
                );
            }
        }
    } catch (error) {
        console.error('Error handling direct message:', error);
    }
}

export { initWS };

// import { WebSocketServer } from 'ws';
// import express from 'express';
// import path from 'path';
// import { createServer } from 'http';
// import { getDb } from './mongo.js';
// import bcrypt from 'bcrypt';
// const app = express();
// const port = process.env.PORT || 8080;

// // Websocket events: (Direct Message)
// //  send_message | client -> server
// //  receive_message | server -> client

// // HTML [DONE] -> CSS [DONE] -> Retrieve Message [] -> Store in DB [] -> Setup WebSocket []
// const httpServer = createServer(app);
// const clients = new Map();
// async function initWS(server) {
//     const wss = new WebSocketServer({ server, path: '/websocket' });
//     wss.on('connection', async (ws, req) => {
//         console.log('New WebSocket connection established');
//         let username = 'Guest';

//         const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
//             const [k, v] = cookie.trim().split('=');
//             acc[k] = v;
//             return acc;

//         }, {});

//         const authToken = cookies?.auth;
//         if (authToken) {
//             const db = await getDb('cse312');
//             const authCollection = db.collection('auth');
//             const authDocs = await authCollection.find({}).toArray();
//             const authDoc = authDocs.find((doc) =>
//                 bcrypt.compareSync(authToken, doc.authtoken)
//             );

//             if (authDoc) {
//                 username = authDoc.user;
//             }

//         }

//         clients.set(ws, username);
//         console.log(`User ${username} connected`);

//         ws.on('message', async (message) => {
//             const data = JSON.parse(message);

//             if (data.type === 'direct_message') {
//                 await handleDM(ws, username, data);
//             }
//             // const { recipient, message } = data; // This is not necessary how data looks

//             // const db = await getDb('cse312');
//             // const messageCollection = db.collection('messages');
//             // const payload = { // Find out actual values and replace the ones below
//             //     user: username,
//             //     recipient: recipient,
//             //     message: message,
//             //     messageID: new ObjectId()
//             // }

//             //await messageCollection.insertOne(payload);
//             // this would be more of a broadcast than dm
//             // for( const client of clients) {
//             //     if(client.readyState === WebSocket.OPEN) {

//             //     }


//             // }

//             //clients[recipient].send(JSON.stringify(payload)); 
//         });

//         ws.on('close', () => {
//             console.log(`User ${username} disconnected`);
//             clients.delete(ws);
//         });
//     });

// }
// async function handleDM(ws, username, data) {
//     const { recipient, message } = data;
//     const payload = { // Find out actual values and replace the ones below
//         user: username,
//         recipient: recipient,
//         message: message,
//         messageID: new ObjectId()
//     }




//     const db = await getDb('cse312');
//     const messageCollection = db.collection('messages');
//     await messageCollection.insertOne(payload);

//     for (const [client, usernam] of clients.entries()) {
//         if (username === recipient && client.readyState === WebSocket.OPEN) {
//             client.send(JSON.stringify(payload));

//         }
//     }
// }

// // function validateUser() {
// //     // Going to check the auth token to see if the user is valid | Most likely will be temporary
// //     return;
// // }


// // Initialize WebSocket server
// // initializeWebSocketServer(httpServer);
// // initWS(httpServer);

// // // Start the server
// // httpServer.listen(port, () => {
// //     console.log(`Server running on port ${port}`);
// // });

// module.exports = { initWS }; // export setupWebSocket