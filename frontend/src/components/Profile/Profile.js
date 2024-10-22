import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [profileData, setProfileData] = useState({ username: '', profilePic: '', bio: '' });
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const savedUsername = localStorage.getItem('username');
        const profileResponse = await axios.get(`http://127.0.0.1:8000/profile/${savedUsername}`);
        setProfileData(profileResponse.data);
        
        // Fetch user's posts
        const postsResponse = await axios.get(`http://127.0.0.1:8000/user-posts/${savedUsername}`);
        setUserPosts(postsResponse.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    
    fetchProfileData();
  }, []);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={profileData.profilePic} alt="Profile" className="profile-pic" />
        <h1>{profileData.username}</h1>
        <p>{profileData.bio}</p>
      </div>

      <div className="posts-section">
        {userPosts.length === 0 ? (
          <p>No posts to show</p>
        ) : (
          userPosts.map((post, index) => (
            <div key={index} className="post-card">
              <img src={post.postImage} alt="Post" className="post-image" />
              <div className="post-details">
                <h2>{post.caption}</h2>
                <p>Likes: {post.likes}</p>
                <p>Comments: {post.comments.length}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
