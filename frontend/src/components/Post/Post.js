import React from 'react';
import './Post.css'; // Add necessary CSS for styling

const Post = ({ username, content, image, timestamp }) => {
  return (
    <div className="post">
      <div className="post-header">
        <h3>{username}</h3>
        <span>{timestamp}</span>
      </div>
      <div className="post-content">
        <p>{content}</p>
        {image && <img src={image} alt="Post" />}
      </div>
      <div className="post-actions">
        <button>❤️ Like</button>
        <button>💬 Comment</button>
      </div>
    </div>
  );
};

export default Post;
