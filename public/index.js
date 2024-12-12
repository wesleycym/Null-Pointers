console.log('Javascript is working!');

let socket; // Websocket variable 
// let clients = set();
document.addEventListener('DOMContentLoaded', () => {
	initWebSocket();
	setupMessageForm();
	setupDirectMessagePopup();
	fetchAndDisplayPosts();
	setInterval(fetchAndDisplayPosts, 5000);
	updatePageForUser();
	setupUserInfoPopup();
	fetchAndDisplayActiveUsers();
	setInterval(fetchAndDisplayActiveUsers, 1000);
});

// Initialize WebSocket connection
function initWebSocket() {
	socket = new WebSocket('wss://' + window.location.host + '/websocket');
	socket.onopen = () => console.log('WebSocket connection established');
	socket.onmessage = handleIncomingMessage;
	socket.onerror = (error) => console.error('WebSocket error:', error);
	socket.onclose = () => console.log('WebSocket connection closed');
}

// Handle incoming WebSocket messages
function handleIncomingMessage(event) {
	const data = JSON.parse(event.data);

	console.log('Received message via WebSocket:', data); // Debug

	if (data.type === 'direct_message') {
		// If the message is from the current user, ignore it to prevent duplicates
		if (data.sender !== currentUsername) {
			addMessageToUI(data);
		}
	} else {
		console.warn('Unhandled WebSocket message type:', data.type);
	}
}
// Setup the DM popup UI
function setupDirectMessagePopup() {
	const dmPopup = document.getElementById('dm-popup');
	const messagesLink = document.getElementById('messages-link');
	const closePopup = document.getElementById('close-dm-popup');

	// Open DM popup
	messagesLink.addEventListener('click', (e) => {
		e.preventDefault();
		dmPopup.classList.remove('hidden');
		fetchConversations();
	});

	// Close DM popup
	closePopup.addEventListener('click', () => {
		dmPopup.classList.add('hidden');
	});
}

// Fetch and display existing conversations
async function fetchConversations() {
	const conversationsList = document.getElementById('dms-list-items');
	conversationsList.innerHTML = ''; // Clear previous items 
	try {
		const response = await axios.get('/chat-messages');
		if (response.status === 200) {
			response.data.forEach((conversation) => {
				const listItem = document.createElement('li');
				listItem.textContent = `${conversation.sender}: ${conversation.message}`;
				conversationsList.appendChild(listItem);
			});
		}
	} catch (error) {
		console.error('Failed to fetch conversations:', error);
	}
}

// Setup DM form for sending messages
function setupMessageForm() {
	const sendButton = document.getElementById('send-dm-btn');
	sendButton.addEventListener('click', () => {
		const recipient = document.getElementById('dm-recipient').value.trim();
		const message = document.getElementById('dm-message').value.trim();
		if (!recipient || !message) {
			alert('Recipient and message cannot be empty!');
			return;
		}
		sendMessage(recipient, message);
	});
}

function setupUserInfoPopup() {
	const UserLink = document.getElementById("user-data"); // Get the messages link
	const userPopup = document.getElementById("user-popup"); // Get the DM popup
	const closePopupBtnUser = document.getElementById("close-user-popup"); // Ge
	// Open DM popup
	UserLink.addEventListener('click', (e) => {
		e.preventDefault();
		userPopup.classList.remove('hidden');
		console.log
		fetchAndDisplayActiveUsers();
	});

	// Close DM popup
	closePopupBtnUser.addEventListener('click', () => {
		userPopup.classList.add('hidden');
	});
}


// Send a message via WebSocket
function sendMessage(recipient, message) {
	console.log(`Sending message to ${recipient}: ${message}`);

	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({
			type: "direct_message",
			recipient: recipient,
			message: message,
		}));

		console.log(`Message sent to ${recipient}: ${message}`);

		// Update the UI immediately
		addMessageToUI({
			sender: 'You', // Indicate that this message is from the sender
			message: message,
			timestamp: new Date(),
		});

		document.getElementById("dm-recipient").value = "";
		document.getElementById("dm-message").value = "";
	} else {
		console.log("Socket is not open");
		alert("Failed to send message");
	}
}

// Add a new message to the DM UI
function addMessageToUI(data) {
	const conversationsList = document.getElementById('dms-list-items');
	if (!conversationsList) {
		console.error('Conversations list element not found');
		return;
	}
	const listItem = document.createElement('li');
	const sender = data.sender === currentUsername ? 'You' : data.sender;
	listItem.textContent = `${sender}: ${data.message}`;
	conversationsList.appendChild(listItem);
}
// Fetch and display posts
function fetchAndDisplayPosts() {
	axios.get('/posts')
		.then((response) => {
			const postsContainer = document.querySelector('.posts');
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
                    ${post.image ? `<div class="post-image"><img src="${post.image}" alt="Post image"></div>` : ''}
                    <div class="post-footer">
                        <button class="like-button ${post.isLiked ? 'liked' : ''}" onclick="handleLikeButtonClick('${post.postID}')">
                            <i class="far fa-heart"></i> Like (${post.likes || 0})
                        </button>
                        <button class="comment-button"><i class="far fa-comment"></i> Comment</button>
                        <button><i class="fas fa-share"></i> Share</button>
                    </div>
                `;
				postsContainer.appendChild(postElement);
			});
		})
		.catch((error) => console.error('Error fetching posts:', error));
}

// Update user details on the page
let currentUsername = '';

function updatePageForUser() {
	axios.get('/auth/identity')
		.then((response) => {
			const user = response.data;
			if (user && user.username) {
				currentUsername = user.username; // Set the current user's username
				const profileElement = document.querySelector('li.profile');
				profileElement.innerHTML = `<a href="#"><i class="fas fa-user"></i> ${user.username}</a>`;
				profileElement.classList.add('logged-in');
			}
		})
		.catch(console.error);


}


// Handle like button click
function handleLikeButtonClick(postID) {
	axios.post('/posts/like', { postID })
		.then(() => fetchAndDisplayPosts())
		.catch((error) => console.error('Error liking post:', error));
}




async function fetchAndDisplayActiveUsers() {
	try {
		const response = await axios.get('/auth/active-users'); // Fetch active users from the server
		const userList = document.getElementById('user-list-items'); 
		userList.textContent = ''
		response.data.forEach((user) => {
			const listItem = document.createElement('li');
			var time = user.timeActive
			if(time < 60){
				listItem.textContent = `${user.username}: Active for ${user.timeActive} seconds`;
				userList.appendChild(listItem);
			}
			if(time > 60){
				time = Math.floor(user.timeActive/60)
				if (time == 1){
					listItem.textContent = `${user.username}: Active for ${Math.floor(user.timeActive/60)} minute`;
					userList.appendChild(listItem);
				}else{
					listItem.textContent = `${user.username}: Active for ${Math.floor(user.timeActive/60)} minutes`;
					userList.appendChild(listItem);
				}

			}
			
		});
	} catch (error) {
		console.error('Error fetching active users:', error);
	}
}


