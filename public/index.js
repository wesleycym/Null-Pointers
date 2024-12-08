console.log('Javascript is working!');

let socket; // Websocket variable 

document.addEventListener('DOMContentLoaded', () => {
	initWebSocket();
	setupMessageForm();
	setupDirectMessagePopup();
	fetchAndDisplayPosts();
	setInterval(fetchAndDisplayPosts, 5000);
	updatePageForUser();
	setupUserInfoPopup();
});

// Initialize WebSocket connection
function initWebSocket() {
	socket = new WebSocket('ws://' + window.location.host + '/websocket');
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
	const UserLink  = document.getElementById("user-data"); // Get the messages link
    const userPopup = document.getElementById("user-popup"); // Get the DM popup
    const closePopupBtnUser = document.getElementById("close-user-popup"); // Ge
	// Open DM popup
	UserLink.addEventListener('click', (e) => {
		e.preventDefault();
		//let usernamesTest = returnUsernamesTest();
		//let timeUpdate = returnTimeUpdate();
		const userList = document.getElementById('user-list-items'); // Get the <ul> element
		userPopup.classList.remove('hidden');
		console.log
		/*if(timeUpdate.length > 0){
			timeUpdate.forEach((value, key) => {
				let i = usernamesTest.get(key)
				const newItem = document.createElement('li'); 
				newItem.textContent = key, "has been " + i + " for: ", + value + " seconds"; 
				userList.appendChild(newItem);
		});
	}*/
		//}else{
		///	const newItem = document.createElement('li'); 
			//newItem.textContent = "No Signed In Users Yet!"; 
			//userList.appendChild(newItem); // Output: 'key1'
		//}
		//for(let i = 0; i < usernamesTest.length; i++){
		
		
		//}
		
		Usernames()
	});

	// Close DM popup
	closePopupBtnUser.addEventListener('click', () => {
		userPopup.classList.add('hidden');
	});
}
//async function getUserNames(){
//	const db = await getDb('cse312'); // connect to cse312

async function Usernames() {
	const conversationsList = document.getElementById('user-list-items');
    if (!conversationsList) {
        console.error('Conversations list element not found');
        return;
    }
    const listItem = document.createElement('li');
    const sender = data.sender;
    listItem.textContent = `Kate: OFFLINE`;
    conversationsList.appendChild(listItem);
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








// console.log('Javascript is working!');

// // Posts
// function fetchAndDisplayPosts() {
// 	let loggedIn = false;
// 	axios
// 		.get('/auth/identity')
// 		.then((response) => {
// 			loggedIn = response.data.username !== undefined;
// 		})
// 		.catch((error) => {
// 			console.error('Error fetching user identity:', error);
// 			loggedIn = false;
// 		});

// 	axios
// 		.get('/posts')
// 		.then((response) => {
// 			const postsContainer = document.querySelector('.posts');
// 			if (!postsContainer) {
// 				console.error('Posts container not found');
// 				return;
// 			}

// 			postsContainer.innerHTML = '';

// 			response.data.forEach((post) => {
// 				const postElement = document.createElement('div');
// 				postElement.classList.add('post');
// 				postElement.dataset.postId = post.postID;
// 				postElement.innerHTML = `
//                 <h3><i class="fas fa-user-circle"></i> ${post.username}</h3>
//                 <p>${post.message}</p>
//                 ${post.image
// 						? `
//                 <div class="post-image">
//                     <img src="${post.image}" alt="Post image">
//                 </div>
//                 `
// 						: ''
// 					}
//                 <div class="post-footer">
//                     <button class="like-button ${post.isLiked ? 'liked' : ''
// 					}" ${loggedIn ? '' : 'disabled'
// 					}><i class="far fa-heart"></i> ${loggedIn ? 'Like' : 'Login to like'
// 					} (${post.likes || 0})</button>
//                     <button class="comment-button"><i class="far fa-comment"></i> Comment</button>
//                     <button><i class="fas fa-share"></i> Share</button>
//                 </div>
//                 `;

// 				axios
// 					.get('/posts/comments')
// 					.then((commentResponse) => {
// 						const postComments = commentResponse.data.filter(
// 							(comment) => comment.postID === post.postID
// 						);
// 						if (postComments.length > 0) {
// 							const commentsHTML = postComments
// 								.map(
// 									(comment) => `
// 								<div class="comment">
// 									<h4><i class="fas fa-user-circle"></i> ${comment.username}</h4>
// 									<p>${comment.message}</p>
// 								</div>
// 							`
// 								)
// 								.join('');
// 							postElement.innerHTML += commentsHTML;
// 						}
// 					})
// 					.catch((error) => {
// 						console.error('Error fetching comments:', error);
// 					});

// 				postsContainer.appendChild(postElement);
// 			});
// 		})
// 		.catch((error) => {
// 			console.error('Error fetching posts:', error);
// 		});
// }

// function handleLikeButtonClick(postID) {
// 	axios
// 		.post('/posts/like', { postID })
// 		.then((response) => {
// 			console.log('Like updated successfully:', response.data);
// 			fetchAndDisplayPosts();
// 		})
// 		.catch((error) => {
// 			console.error('Error updating like:', error);
// 		});
// }

// function updatePageForUser() {
// 	axios
// 		.get('/auth/identity')
// 		.then((response) => {
// 			const user = response.data;
// 			console.log(response.data);
// 			if (user && user.username) {
// 				const profileNameElement = document.querySelector('li.profile');
// 				console.log(profileNameElement);
// 				if (profileNameElement) {
// 					profileNameElement.innerHTML = `<a href="#"><i class="fas fa-user"></i> ${user.username}</a>`;
// 					profileNameElement.classList.add('logged-in');

// 					/*const authLink = document.querySelector('li.auth-link');
// 					if (authLink) {
// 						authLink.innerHTML = `<a href="/routes/auth/logout"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>`;
// 					}*/
// 				}
// 			}
// 		})
// 	/*.catch((error) => {
// 		const authLink = document.querySelector('li.auth-link');
// 		if (authLink) {
// 			authLink.innerHTML = `<a href="/"><i class="fa-solid fa-sign-in-alt"></i> Logout</a>`;
// 		}
// 	});*/
// }

// function showCommentForm(postID) {
// 	const modal = document.createElement('div');
// 	modal.className = 'modal';
// 	modal.style.position = 'fixed';
// 	modal.style.top = '50%';
// 	modal.style.left = '50%';
// 	modal.style.width = '50%';
// 	modal.style.height = 'auto';
// 	modal.style.zIndex = '9999';
// 	modal.style.backgroundColor = '#E6ECF0';
// 	modal.style.borderRadius = '10px';
// 	modal.style.padding = '20px';
// 	modal.style.transform = 'translate(-50%, -50%)';
// 	modal.innerHTML = `
//         <div class="modal-content">
//             <span class="close" style="font-size: 24px; cursor: pointer;">&times;</span>
//             <div class="comment-input">
//                 <form action="/posts/comment" method="post" class="comment-form">
//                     <input type="hidden" name="postID" value="${postID}">
//                     <label for="">Comment: <br></label>
//                     <textarea name="comment" id="comment" placeholder="Write a comment" rows="4"
//                         required></textarea><br>
//                     <button type="submit" id="submit-comment" class=""><i
//                             class="fas fa-paper-plane"></i>Reply</button>
//                 </form>
//             </div>
//         </div>
//     `;
// 	document.querySelector('.comment-modal').appendChild(modal);

// 	modal.querySelector('.close').addEventListener('click', () => {
// 		modal.remove();
// 	});
// }

// document.querySelector('.posts').addEventListener('click', (event) => {
// 	if (event.target.closest('.comment-button')) {
// 		const postElement = event.target.closest('.post');
// 		const postID = postElement.dataset.postId;
// 		showCommentForm(postID);
// 	}
// });

// document.addEventListener('DOMContentLoaded', () => {
// 	fetchAndDisplayPosts();
// 	setInterval(fetchAndDisplayPosts, 5000);
// 	updatePageForUser();
// 	initWebSocket();
// 	setupMessageForm();
// 	fetchChatHistory();

// 	document.querySelector('.posts').addEventListener('click', (event) => {
// 		if (event.target.closest('.like-button')) {
// 			const postElement = event.target.closest('.post');
// 			const postID = postElement.dataset.postId;
// 			handleLikeButtonClick(postID);
// 		}
// 	});
// });

// let socket;

// function initWebSocket() {
// 	socket = new WebSocket('ws://' + window.location.host + '/websocket');

// 	socket.onopen = () => {
// 		console.log('WebSocket connection established');
// 	};

// 	socket.onmessage = (event) => {
// 		console.log('Message from server:', event.data);
// 		const data = JSON.parse(event.data);

// 		if (data.type === 'direct_message') {
// 			addDirectMessage(data);
// 		}

// 	};

// 	socket.onclose = () => {
// 		console.log('WebSocket connection closed');
// 	};

// 	socket.onerror = (error) => {
// 		console.error('WebSocket error:', error);
// 	};
// }

// function setupMessageForm() {
// 	const messageForm = document.getElementById('message-form');
// 	const recipientInput = document.getElementById('recipient');
// 	const messageInput = document.getElementById('message-box');

// 	messageForm.addEventListener('submit', (event) => {
// 		event.preventDefault();

// 		const recipient = recipientInput.value.trim();
// 		const message = messageInput.value.trim();

// 		if (!recipient || !message) {
// 			alert('Recipient and message cannot be empty');
// 			return;
// 		}

// 		sendMessage(recipient, message);
// 		messageInput.value = '';
// 	});
// }

// function sendMessage(recipient, message) {
// 	const payload = {
// 		type: 'direct_message',
// 		recipient: recipient,
// 		message: message
// 	};

// 	if (socket && socket.readyState === WebSocket.OPEN) {
// 		socket.send(JSON.stringify(payload));
// 		console.log(`Message sent to ${recipient}: ${message}`);

// 	} else {
// 		console.log("Socket is not open");
// 	}


// }


// async function fetchChatHistory() {
// 	const recipientInput = document.getElementById('recipient');
// 	const recipient = recipientInput.value.trim();

// 	if (!recipient) {
// 		console.error('Recipient is not specified for chat history');
// 		return;
// 	}

// 	try {
// 		const response = await fetch(`/chat-messages?recipient=${recipient}`);
// 		if (response.ok) {
// 			const messages = await response.json();
// 			const messagesContainer = document.querySelector('.messages');
// 			messagesContainer.innerHTML = ''; // Clear existing messages

// 			messages.forEach((message) => addMessageToChat(message));
// 		} else {
// 			console.error('Failed to fetch chat history:', await response.text());
// 		}
// 	} catch (error) {
// 		console.error('Error fetching chat history:', error);
// 	}
// }


// function addMessageToChat(message) {
// 	const messagesContainer = document.querySelector('.messages');
// 	if (!messagesContainer) {
// 		console.error('Messages container not found');
// 		return;
// 	}

// 	const messageElement = document.createElement('div');
// 	messageElement.classList.add('message');
// 	messageElement.innerHTML = `
//         <strong>${message.sender}:</strong> ${message.message}
//     `;
// 	messagesContainer.appendChild(messageElement);

// 	// Auto-scroll to the latest message
// 	messagesContainer.scrollTop = messagesContainer.scrollHeight;
// }


