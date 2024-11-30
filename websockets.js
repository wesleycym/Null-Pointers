import { WebSocketServer } from 'ws';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { getDb } from './mongo.js';

const connections = new Map(); // Store authenticated connections

export async function initializeWebSocketServer(httpServer) {
    const db = await getDb('cse312');
    const messagesCollection = db.collection('messages');
    const wss = new WebSocketServer({ server: httpServer, path: '/websocket' });

    wss.on('connection', (ws, req) => {
        // Authenticate the user during the WebSocket handshake
        const cookies = cookie.parse(req.headers.cookie || '');
        const token = cookies.authToken; // Replace with your auth token cookie name

        let username = 'Guest';
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace JWT_SECRET with your secret
                username = decoded.username || 'Guest';
            } catch (error) {
                console.error('Invalid token:', error.message);
            }
        }

        console.log(`User connected: ${username}`);

        // Add connection to the map
        connections.set(ws, username);

        // Handle incoming messages
        ws.on('message', (data) => {
            handleWebSocketMessage(ws, data, username, messagesCollection);
        });

        // Handle disconnection
        ws.on('close', () => {
            connections.delete(ws);
            console.log(`User disconnected: ${username}`);
        });
    });

    function handleWebSocketMessage(ws, data, username, messagesCollection) {
        try {
            const frame = JSON.parse(data);
            if (frame.messageType === 'chatMessage') {
                const escapedMessage = escapeHtml(frame.message);
                const messagePayload = {
                    messageType: 'chatMessage',
                    username,
                    message: escapedMessage,
                    id: Date.now().toString(), // Unique ID for each message
                    timestamp: new Date(),
                };

                saveMessageToDatabase(messagesCollection, messagePayload);

                // Broadcast to all connected clients
                for (const [client] of connections.entries()) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(messagePayload));
                    }
                }
            }
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
        }
    }

    async function saveMessageToDatabase(messagesCollection, messagePayload) {
        try {
            await messagesCollection.insertOne(messagePayload);
        } catch (error) {
            console.error('Error saving message to database:', error);
        }
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}




// import { WebSocketServer } from 'ws';
// import { getDb } from './mongo.js';

// const connections = new Map(); // Maps WebSocket connections to usernames

// export function initializeWebSocketServer(httpServer) {
//     const wss = new WebSocketServer({ server: httpServer, path: '/websocket' });

//     wss.on('connection', async (ws, req) => {
//         console.log('New WebSocket connection established');

//         let username = 'Guest'; // Default username

//         // Simulate authentication using cookies
//         const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
//             const [key, value] = cookie.trim().split('=');
//             acc[key] = value;
//             return acc;
//         }, {});

//         if (cookies && cookies.authToken) {
//             try {
//                 const decoded = jwt.verify(cookies.authToken, process.env.JWT_SECRET);
//                 username = decoded.username || 'Guest';
//             } catch (err) {
//                 console.error('Failed WebSocket authentication:', err.message);
//             }
//         }

//         // Store connection
//         connections.set(ws, username);

//         // Handle incoming messages
//         ws.on('message', async (data) => {
//             try {
//                 const parsedData = JSON.parse(data);
//                 if (parsedData.messageType === 'chatMessage') {
//                     const { message } = parsedData;

//                     const db = await getDb('cse312');
//                     const messagesCollection = db.collection('messages');
//                     const messagePayload = {
//                         username,
//                         message,
//                         timestamp: new Date(),
//                     };

//                     // Save message to database
//                     await messagesCollection.insertOne(messagePayload);

//                     // Broadcast message to all connected clients
//                     for (const client of wss.clients) {
//                         if (client.readyState === ws.OPEN) {
//                             client.send(
//                                 JSON.stringify({
//                                     messageType: 'chatMessage',
//                                     ...messagePayload,
//                                 })
//                             );
//                         }
//                     }
//                 }
//             } catch (err) {
//                 console.error('Error processing WebSocket message:', err);
//             }
//         });

//         // Handle disconnection
//         ws.on('close', () => {
//             connections.delete(ws);
//             console.log(`User ${username} disconnected`);
//         });
//     });

//     console.log('WebSocket server initialized on /websocket');
// }











// import { WebSocketServer } from 'ws';
// import cookie from 'cookie';
// import jwt from 'jsonwebtoken';
// import { getDb } from './mongo.js';

// const connections = new Map(); // Store WebSocket connections

// export function initializeWebSocketServer(httpServer) {
//     const wss = new WebSocketServer({ server: httpServer, path: '/websocket' });

//     wss.on('connection', (ws, req) => {
//         const cookies = cookie.parse(req.headers.cookie || '');
//         const token = cookies.authToken;
//         let username = 'Guest';

//         if (token) {
//             try {
//                 const decoded = jwt.verify(token, process.env.JWT_SECRET);
//                 username = decoded.username || 'Guest';
//             } catch (error) {
//                 console.error('Invalid token:', error.message);
//             }
//         }

//         console.log(`User connected: ${username}`);
//         connections.set(ws, username);

//         let buffer = Buffer.alloc(0);

//         ws.on('message', (chunk) => {
//             buffer = Buffer.concat([buffer, chunk]);

//             const payloadLength = parsePayloadLength(buffer);
//             if (buffer.length >= payloadLength) {
//                 const message = parseFrame(buffer);
//                 handleWebSocketMessage(ws, message, username);
//                 buffer = Buffer.alloc(0);
//             }
//         });

//         ws.on('close', () => {
//             connections.delete(ws);
//             console.log(`User disconnected: ${username}`);
//         });
//     });

//     function parsePayloadLength(buffer) {
//         const lengthByte = buffer[1] & 127;
//         if (lengthByte <= 125) return lengthByte;
//         if (lengthByte === 126) return buffer.readUInt16BE(2);
//         if (lengthByte === 127) return Number(buffer.readBigUInt64BE(2));
//     }

//     function parseFrame(buffer) {
//         const lengthByte = buffer[1] & 127;
//         let offset = 2;

//         if (lengthByte === 126) offset += 2;
//         if (lengthByte === 127) offset += 8;

//         const maskingKey = buffer.slice(offset, offset + 4);
//         offset += 4;

//         const payload = buffer.slice(offset);
//         const unmaskedPayload = Buffer.alloc(payload.length);

//         for (let i = 0; i < payload.length; i++) {
//             unmaskedPayload[i] = payload[i] ^ maskingKey[i % 4];
//         }

//         return unmaskedPayload.toString('utf8');
//     }

//     function handleWebSocketMessage(ws, message, username) {
//         try {
//             const parsedMessage = JSON.parse(message);
//             if (parsedMessage.messageType === 'chatMessage') {
//                 const broadcastMessage = {
//                     messageType: 'chatMessage',
//                     username,
//                     message: parsedMessage.message,
//                     id: Date.now().toString(),
//                 };

//                 saveMessageToDatabase(broadcastMessage);

//                 for (const [client] of connections.entries()) {
//                     if (client.readyState === WebSocket.OPEN) {
//                         client.send(JSON.stringify(broadcastMessage));
//                     }
//                 }
//             }
//         } catch (error) {
//             console.error('Error processing WebSocket message:', error);
//         }
//     }

//     async function saveMessageToDatabase(message) {
//         try {
//             const db = await getDb('cse312');
//             const messagesCollection = db.collection('messages');
//             await messagesCollection.insertOne(message);
//         } catch (error) {
//             console.error('Error saving message to database:', error);
//         }
//     }
// }
