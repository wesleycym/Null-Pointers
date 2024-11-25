import { WebSocketServer } from 'ws';

// Websocket events: (Direct Message)
//  send_message | client -> server
//  receive_message | server -> client

// HTML [DONE] -> CSS [DONE] -> Retrieve Message [] -> Store in DB [] -> Setup WebSocket []

function setupWebSocket(server, db)
{
    return;
}

function validateUser()
{
    // Going to check the auth token to see if the user is valid | Most likely will be temporary
    return;
}


module.exports = { setupWebSocket }; // export setupWebSocket