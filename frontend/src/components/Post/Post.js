import React, { useState } from 'react';
import axios from 'axios';
import './Post.css';

const Post = () => {
  const [username, setUsername] = useState(''); // Added username
  const [caption, setCaption] = useState('');
  const [postImage, setPostImage] = useState(null);

  const handleImageChange = (e) => {
    setPostImage(e.target.files[0]);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('username', username); // Include username in the formData
    formData.append('caption', caption);
    if (postImage) {
      formData.append('postImage', postImage);
    }

    try {
      await axios.post('http://127.0.0.1:8000/create-post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Post created successfully!');
      setUsername(''); // Clear fields after successful post
      setCaption('');
      setPostImage(null);
    } catch (error) {
      console.error('Error creating post:', error.response?.data || error.message);
      alert(`Error creating post: ${error.response?.data?.error || 'Unknown error'}`);
    }
  };

  return (
    <div className="post-container">
      <form className="post-form" onSubmit={handlePostSubmit}>
        <h1>Create New Post</h1>
        <input
          type="text"
          placeholder="Username"  // Added username input field
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="post-input"
          required
        />
        <input
          type="text"
          placeholder="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="post-input"
          required
        />
        <input
          type="file"
          onChange={handleImageChange}
          className="post-input"
          accept="image/*"
        />
        <button type="submit" className="post-btn">Post</button>
      </form>
    </div>
  );
};

export default Post;
