console.log('Javascript is working!');

// Posts
function fetchAndDisplayPosts() {
	let loggedIn = false;
	axios
		.get('/auth/identity')
		.then((response) => {
			loggedIn = response.data.username !== undefined;
		})
		.catch((error) => {
			console.error('Error fetching user identity:', error);
			loggedIn = false;
		});

	axios
		.get('/posts')
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
                ${
									post.image
										? `
                <div class="post-image">
                    <img src="${post.image}" alt="Post image">
                </div>
                `
										: ''
								}
                <div class="post-footer">
                    <button class="like-button ${
											post.isLiked ? 'liked' : ''
										}" ${
					loggedIn ? '' : 'disabled'
				}><i class="far fa-heart"></i> ${
					loggedIn ? 'Like' : 'Login to like'
				} (${post.likes || 0})</button>
                    <button class="comment-button"><i class="far fa-comment"></i> Comment</button>
                    <button><i class="fas fa-share"></i> Share</button>
                </div>
                `;

				axios
					.get('/posts/comments')
					.then((commentResponse) => {
						const postComments = commentResponse.data.filter(
							(comment) => comment.postID === post.postID
						);
						if (postComments.length > 0) {
							const commentsHTML = postComments
								.map(
									(comment) => `
								<div class="comment">
									<h4><i class="fas fa-user-circle"></i> ${comment.username}</h4>
									<p>${comment.message}</p>
								</div>
							`
								)
								.join('');
							postElement.innerHTML += commentsHTML;
						}
					})
					.catch((error) => {
						console.error('Error fetching comments:', error);
					});

				postsContainer.appendChild(postElement);
			});
		})
		.catch((error) => {
			console.error('Error fetching posts:', error);
		});
}

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

function updatePageForUser() {
	axios
		.get('/auth/identity')
		.then((response) => {
			const user = response.data;
			console.log(response.data);
			if (user && user.username) {
				const profileNameElement = document.querySelector('li.profile');
				console.log(profileNameElement);
				if (profileNameElement) {
					profileNameElement.innerHTML = `<a href="#"><i class="fas fa-user"></i> ${user.username}</a>`;
					profileNameElement.classList.add('logged-in');

					/*const authLink = document.querySelector('li.auth-link');
					if (authLink) {
						authLink.innerHTML = `<a href="/routes/auth/logout"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>`;
					}*/
				}
			}
		})
		/*.catch((error) => {
			const authLink = document.querySelector('li.auth-link');
			if (authLink) {
				authLink.innerHTML = `<a href="/"><i class="fa-solid fa-sign-in-alt"></i> Logout</a>`;
			}
		});*/
}

function showCommentForm(postID) {
	const modal = document.createElement('div');
	modal.className = 'modal';
	modal.style.position = 'fixed';
	modal.style.top = '50%';
	modal.style.left = '50%';
	modal.style.width = '50%';
	modal.style.height = 'auto';
	modal.style.zIndex = '9999';
	modal.style.backgroundColor = '#E6ECF0';
	modal.style.borderRadius = '10px';
	modal.style.padding = '20px';
	modal.style.transform = 'translate(-50%, -50%)';
	modal.innerHTML = `
        <div class="modal-content">
            <span class="close" style="font-size: 24px; cursor: pointer;">&times;</span>
            <div class="comment-input">
                <form action="/posts/comment" method="post" class="comment-form">
                    <input type="hidden" name="postID" value="${postID}">
                    <label for="">Comment: <br></label>
                    <textarea name="comment" id="comment" placeholder="Write a comment" rows="4"
                        required></textarea><br>
                    <button type="submit" id="submit-comment" class=""><i
                            class="fas fa-paper-plane"></i>Reply</button>
                </form>
            </div>
        </div>
    `;
	document.querySelector('.comment-modal').appendChild(modal);

	modal.querySelector('.close').addEventListener('click', () => {
		modal.remove();
	});
}

document.querySelector('.posts').addEventListener('click', (event) => {
	if (event.target.closest('.comment-button')) {
		const postElement = event.target.closest('.post');
		const postID = postElement.dataset.postId;
		showCommentForm(postID);
	}
});

document.addEventListener('DOMContentLoaded', () => {
	fetchAndDisplayPosts();
	setInterval(fetchAndDisplayPosts, 5000);
	updatePageForUser();

	document.querySelector('.posts').addEventListener('click', (event) => {
		if (event.target.closest('.like-button')) {
			const postElement = event.target.closest('.post');
			const postID = postElement.dataset.postId;
			handleLikeButtonClick(postID);
		}
	});
});
