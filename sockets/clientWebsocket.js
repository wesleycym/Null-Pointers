const socket = new WebSocket('ws://localhost:8080');

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