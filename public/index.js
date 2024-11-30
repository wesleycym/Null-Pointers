console.log('JavaScript is working!');

// Global WebSocket variable
let socket;

// Document ready event
document.addEventListener('DOMContentLoaded', () => {
	initializeWebSocket(); // Initialize WebSocket
	fetchAndDisplayPosts(); // Fetch posts
	setInterval(fetchAndDisplayPosts, 5000); // Refresh posts periodically
	updatePageForUser(); // Update the UI for the current user

	// Add event listeners for posts
	document.querySelector('.posts').addEventListener('click', (event) => {
		if (event.target.closest('.like-button')) {
			const postElement = event.target.closest('.post');
			const postID = postElement.dataset.postId;
			handleLikeButtonClick(postID);
		} else if (event.target.closest('.comment-button')) {
			const postElement = event.target.closest('.post');
			const postID = postElement.dataset.postId;
			showCommentForm(postID);
		}
	});

	// Fetch chat history when the recipient changes
	const recipientField = document.getElementById('recipient');
	if (recipientField) {
		recipientField.addEventListener('change', () => {
			const recipient = recipientField.value.trim();
			if (recipient) fetchChatHistory(recipient);
		});
	}
});

// Initialize WebSocket connection
function initializeWebSocket() {
	socket = new WebSocket('ws://' + window.location.host + '/websocket');

	// Handle successful connection
	socket.onopen = () => {
		console.log('WebSocket connection established');
	};

	// Handle incoming WebSocket messages
	socket.onmessage = (event) => {
		try {
			const message = JSON.parse(event.data);
			if (message.messageType === 'chatMessage') {
				addMessageToChat(message); // Display new message
			} else {
				console.warn('Unhandled message type:', message.messageType);
			}
		} catch (error) {
			console.error('Error parsing WebSocket message:', error);
		}
	};

	// Handle connection closure
	socket.onclose = () => {
		console.warn('WebSocket connection closed');
	};

	// Handle WebSocket errors
	socket.onerror = (error) => {
		console.error('WebSocket error:', error);
	};
}

// Fetch posts and display them
function fetchAndDisplayPosts() {
	let loggedIn = false;

	// Fetch user identity
	axios
		.get('/auth/identity')
		.then((response) => {
			loggedIn = response.data.username !== undefined;
		})
		.catch((error) => {
			console.error('Error fetching user identity:', error);
			loggedIn = false;
		});

	// Fetch posts
	axios
		.get('/posts')
		.then((response) => {
			const postsContainer = document.querySelector('.posts');
			console.log('Fetched posts:', response.data); // Debug log
			if (!postsContainer) {
				console.error('Posts container not found');
				return;
			}

			postsContainer.innerHTML = '';

			response.data.forEach((post) => {
				const postElement = document.createElement('div');
				postElement.classList.add('post');
				postElement.dataset.postId = post.postID;
				postElement.innerHTML = `
                    <h3><i class="fas fa-user-circle"></i> ${post.username}</h3>
                    <p>${post.message}</p>
                    ${post.image
						? `<div class="post-image"><img src="${post.image}" alt="Post image"></div>`
						: ''
					}
                    <div class="post-footer">
                        <button class="like-button ${post.isLiked ? 'liked' : ''}" ${loggedIn ? '' : 'disabled'
					}><i class="far fa-heart"></i> ${loggedIn ? 'Like' : 'Login to like'} (${post.likes || 0})</button>
                        <button class="comment-button"><i class="far fa-comment"></i> Comment</button>
                        <button><i class="fas fa-share"></i> Share</button>
                    </div>
                `;

				postsContainer.appendChild(postElement);
			});
		})
		.catch((error) => {
			console.error('Error fetching posts:', error);
		});
}

// Handle like button clicks
function handleLikeButtonClick(postID) {
	axios
		.post('/posts/like', { postID })
		.then((response) => {
			console.log('Like updated successfully:', response.data);
			fetchAndDisplayPosts();
		})
		.catch((error) => {
			console.error('Error updating like:', error);
		});
}

// Update page UI for the current user
function updatePageForUser() {
	axios
		.get('/auth/identity')
		.then((response) => {
			const user = response.data;
			if (user && user.username) {
				const profileNameElement = document.querySelector('li.profile');
				if (profileNameElement) {
					profileNameElement.innerHTML = `<a href="#"><i class="fas fa-user"></i> ${user.username}</a>`;
					profileNameElement.classList.add('logged-in');
				}
			}
		})
		.catch((error) => {
			console.error('Error fetching user identity:', error);
		});
}

// Fetch chat history from the server
async function fetchChatHistory(recipient) {
	try {
		const response = await fetch(`/chat-messages`);
		if (response.ok) {
			const messages = await response.json();
			const messagesContainer = document.querySelector('.messages');
			messagesContainer.innerHTML = ''; // Clear existing messages

			messages
				.filter((msg) => msg.recipient === recipient || msg.username === recipient)
				.forEach((message) => addMessageToChat(message));
		} else {
			console.error('Failed to fetch chat history:', await response.text());
		}
	} catch (error) {
		console.error('Error fetching chat history:', error);
	}
}

// Send a chat message
function sendMessage() {
	const recipientField = document.getElementById('recipient');
	const messageBox = document.getElementById('message-box');

	const recipient = recipientField.value.trim();
	const message = messageBox.value.trim();
	messageBox.value = '';

	if (!message || !recipient) {
		console.error('Recipient and message cannot be empty');
		return;
	}

	const payload = {
		messageType: 'chatMessage',
		recipient,
		message,
	};

	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify(payload));
		console.log('Message sent:', payload);
	} else {
		console.error('WebSocket is not connected');
	}
}

// Add a new message to the chat UI
function addMessageToChat(messageJSON) {
	const messagesContainer = document.querySelector('.messages');
	if (!messagesContainer) return;

	const messageElement = document.createElement('div');
	messageElement.classList.add('message');
	messageElement.innerHTML = `
        <strong>${messageJSON.username}:</strong> ${messageJSON.message}
    `;
	messagesContainer.appendChild(messageElement);

	// Auto-scroll to the latest message
	messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// let socket;

// Initialize WebSocket
// document.addEventListener('DOMContentLoaded', () => {
// 	initializeWebSocket();

// 	// Fetch chat history when the recipient changes
// 	document.getElementById('recipient').addEventListener('change', (event) => {
// 		const recipient = event.target.value.trim();
// 		if (recipient) fetchChatHistory(recipient);
// 	});
// });

// Initialize WebSocket
// function initializeWebSocket() {
// 	socket = new WebSocket('ws://' + window.location.host + '/websocket');

// 	socket.onopen = () => {
// 		console.log('WebSocket connection established');
// 	};

// 	socket.onmessage = (event) => {
// 		try {
// 			const message = JSON.parse(event.data);
// 			if (message.messageType === 'chatMessage') {
// 				addMessageToChat(message);
// 			} else {
// 				console.warn('Unhandled message type:', message.messageType);
// 			}
// 		} catch (error) {
// 			console.error('Error parsing WebSocket message:', error);
// 		}
// 	};

// 	socket.onclose = () => {
// 		console.warn('WebSocket connection closed');
// 	};

// 	socket.onerror = (error) => {
// 		console.error('WebSocket error:', error);
// 	};
// }

// // Fetch chat history from the server
// async function fetchChatHistory(recipient) {
// 	try {
// 		const response = await fetch(`/chat-messages`);
// 		if (response.ok) {
// 			const messages = await response.json();
// 			const messagesContainer = document.querySelector('.messages');
// 			messagesContainer.innerHTML = ''; // Clear existing messages

// 			messages
// 				.filter((msg) => msg.recipient === recipient || msg.sender === recipient)
// 				.forEach((message) => addMessageToChat(message));
// 		} else {
// 			console.error('Failed to fetch chat history:', await response.text());
// 		}
// 	} catch (error) {
// 		console.error('Error fetching chat history:', error);
// 	}
// }

// Send a chat message
// function sendMessage() {
// 	const recipient = document.getElementById('recipient').value.trim();
// 	const messageBox = document.getElementById('message-box');
// 	const message = messageBox.value.trim();
// 	messageBox.value = '';

// 	if (!message || !recipient) {
// 		console.error('Recipient and message cannot be empty');
// 		return;
// 	}

// 	const payload = {
// 		messageType: 'chatMessage',
// 		recipient,
// 		message,
// 	};

// 	if (socket && socket.readyState === WebSocket.OPEN) {
// 		socket.send(JSON.stringify(payload));
// 		console.log('Message sent:', payload);
// 	} else {
// 		console.error('WebSocket is not connected');
// 	}
// }

// // Add a message to the chat UI
// function addMessageToChat(messageJSON) {
// 	const messagesContainer = document.querySelector('.messages');
// 	if (!messagesContainer) return;

// 	const messageElement = document.createElement('div');
// 	messageElement.classList.add('message');
// 	messageElement.innerHTML = `
//         <strong>${messageJSON.username}:</strong> ${messageJSON.message}
//     `;
// 	messagesContainer.appendChild(messageElement);

// 	// Auto-scroll to the latest message
// 	messagesContainer.scrollTop = messagesContainer.scrollHeight;
// }
