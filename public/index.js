console.log('Javascript is working!');

// Posts
function fetchAndDisplayPosts() {
	axios
		.get('/posts')
		.then((response) => {
			const postsContainer = document.querySelector('.posts');
			if (!postsContainer) {
				console.error('Posts container not found');
				return;
			}

			postsContainer.innerHTML = ''; // Clear existing posts

			response.data.forEach((post) => {
				const postElement = document.createElement('div');
				postElement.classList.add('post');
				postElement.dataset.postId = post.postID; // Added post ID to the post element
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
										}"><i class="far fa-heart"></i> Like (${
					post.likes || 0
				})</button>
                    <button><i class="far fa-comment"></i> Comment</button>
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

function handleLikeButtonClick(postID) {
	axios
		.post('/posts/like', { postID })
		.then((response) => {
			console.log('Like updated successfully:', response.data);
			fetchAndDisplayPosts(); // Refresh the posts to show updated like count
		})
		.catch((error) => {
			console.error('Error updating like:', error);
		});
}

function updateProfileName() {
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
				}
			}
		})
		.catch((error) => {
			console.error('Error fetching user identity:', error);
		});
}

document.addEventListener('DOMContentLoaded', () => {
	fetchAndDisplayPosts();
	setInterval(fetchAndDisplayPosts, 1000);
	updateProfileName();

	document.querySelector('.posts').addEventListener('click', (event) => {
		if (event.target.closest('.like-button')) {
			const postElement = event.target.closest('.post');
			const postID = postElement.dataset.postId; // Using dataset to get post ID
			handleLikeButtonClick(postID);
		}
	});
});
