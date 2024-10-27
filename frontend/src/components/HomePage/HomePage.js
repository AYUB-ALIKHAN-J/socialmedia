import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HomePage.css'; // Make sure to create a CSS file for styling if needed
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [followedUsers, setFollowedUsers] = useState(new Set()); // Track followed users

  useEffect(() => {
    const fetchPostsAndUserData = async () => {
      try {
        const savedUsername = localStorage.getItem('username');
        setCurrentUser(savedUsername);

        // Fetch followed users
        const userResponse = await axios.get(`http://127.0.0.1:8000/profile/${savedUsername}`);
        setFollowedUsers(new Set(userResponse.data.following));

        // Fetch posts of followed users
        const postsResponse = await axios.get('http://127.0.0.1:8000/all-posts');
        const filteredPosts = postsResponse.data.filter(post => 
          userResponse.data.following.includes(post.username)
        );
        setPosts(filteredPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPostsAndUserData();
  }, []);

  const handleFollow = async (username) => {
    try {
      await axios.post(`http://127.0.0.1:8000/follow/${username}`, { currentUser });
      setFollowedUsers(prev => new Set(prev).add(username)); // Add user to followed
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (username) => {
    try {
      await axios.post(`http://127.0.0.1:8000/unfollow/${username}`, { currentUser });
      setFollowedUsers(prev => {
        const updated = new Set(prev);
        updated.delete(username);
        return updated; // Remove user from followed
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  // Handle like/unlike functionality
  const handleLike = async (postId, isLiked) => {
    try {
      const response = await axios.post(`http://127.0.0.1:8000/${isLiked ? 'unlike-post' : 'like-post'}/${postId}`, {
        username: currentUser,
      });

      // Update the post likes in the frontend
      const updatedPosts = posts.map(post =>
        post._id === postId ? { ...post, likes: response.data.likes } : post
      );
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  // Handle comment functionality
  const handleComment = async (postId) => {
    const comment = commentInputs[postId] || ''; // get the current comment input for this post

    if (!comment) return; // prevent empty comments

    try {
      const response = await axios.post(`http://127.0.0.1:8000/comment-post/${postId}`, {
        username: currentUser,
        comment,
      });

      // Update the post comments in the frontend
      const updatedPosts = posts.map(post =>
        post._id === postId ? { ...post, comments: response.data.comments } : post
      );
      setPosts(updatedPosts);

      // Clear the comment input for this post
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  };

  // Handle input change for comment fields
  const handleInputChange = (postId, value) => {
    setCommentInputs({ ...commentInputs, [postId]: value });
  };

  return (
    <div className="home-page-container">
      <h1>Home Page</h1>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post._id} className="post-card">
            <img
              src={`http://localhost:8000/${post.postImage}`}
              alt="Post"
              className="post-image"
            />
            <div className="post-details">
              <h2>{post.caption}</h2>
              <p>Posted by: {post.username}</p>
              <p>Likes: {post.likes?.length || 0}</p> {/* Safely accessing likes */}
              <p>Comments: {post.comments?.length || 0}</p> {/* Safely accessing comments */}

              {/* Follow/Unfollow button */}
              {followedUsers.has(post.username) ? (
                <button onClick={() => handleUnfollow(post.username)} className="follow-btn unfollow">
                  <FaUserCheck /> Unfollow
                </button>
              ) : (
                <button onClick={() => handleFollow(post.username)} className="follow-btn follow">
                  <FaUserPlus /> Follow
                </button>
              )}

              <button
                onClick={() => handleLike(post._id, post.likes?.includes(currentUser) || false)} // Safely checking if current user liked the post
                className={post.likes?.includes(currentUser) ? 'like-btn liked' : 'like-btn'}
              >
                {post.likes?.includes(currentUser) ? 'Unlike' : 'Like'}
              </button>

              <input
                type="text"
                value={commentInputs[post._id] || ''} // bind input to state
                onChange={(e) => handleInputChange(post._id, e.target.value)}
                placeholder="Add a comment"
                className="comment-input"
              />
              <button
                onClick={() => handleComment(post._id)}
                className="comment-btn"
              >
                Comment
              </button>
              <div className="comments-section">
                {post.comments?.map((comment) => (
                  <p key={comment._id}>
                    <span>{comment.username}:</span> {comment.comment}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No posts available</p>
      )}
    </div>
  );
};

export default HomePage;
