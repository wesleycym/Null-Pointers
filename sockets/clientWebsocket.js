const socket = new WebSocket('ws://' + window.location.host + '/websocket');

socket.addEventListener('open', () => {
    console.log('WebSocket connection established');
});

socket.addEventListener('message', (event) => {
    console.log('Message from server:', event.data);
});

socket.addEventListener('close', () => {
    console.log('WebSocket connection closed');
});

export default socket;

// There is no need to use this file