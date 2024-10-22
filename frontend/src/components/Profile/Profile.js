import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [profileData, setProfileData] = useState({ username: '', profilePic: '', bio: '' });
  const [userPosts, setUserPosts] = useState([]);
  const [editMode, setEditMode] = useState(false); // State to toggle edit mode
  const [newBio, setNewBio] = useState(''); // To store new bio
  const [newProfilePic, setNewProfilePic] = useState(null); // To store new profile picture

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

  // Handle profile update
  const handleProfileUpdate = async () => {
    const formData = new FormData();
    formData.append('bio', newBio); // Append new bio
    if (newProfilePic) {
      formData.append('profilePic', newProfilePic); // Append new profilePic if uploaded
    }

    try {
      const savedUsername = localStorage.getItem('username');
      const response = await axios.put(`http://127.0.0.1:8000/edit-profile/${savedUsername}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setProfileData(response.data.user); // Update the profile data on the frontend
      setEditMode(false); // Exit edit mode after successful update
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={profileData.profilePic} alt="Profile" className="profile-pic" />
        <h1>{profileData.username}</h1>
        <p>{profileData.bio}</p>
        <button onClick={() => setEditMode(true)} className="edit-profile-btn">
          Edit Profile
        </button>
      </div>

      {editMode && (
        <div className="edit-profile-form">
          <h2>Edit Profile</h2>
          <input
            type="text"
            placeholder="Update bio"
            value={newBio}
            onChange={(e) => setNewBio(e.target.value)}
          />
          <input type="file" onChange={(e) => setNewProfilePic(e.target.files[0])} />
          <button onClick={handleProfileUpdate} className="save-btn">
            Save
          </button>
          <button onClick={() => setEditMode(false)} className="cancel-btn">
            Cancel
          </button>
        </div>
      )}

      <div className="posts-section">
        {userPosts.length === 0 ? (
          <p>No posts to show</p>
        ) : (
          userPosts.map((post, index) => (
            <div key={index} className="post-card">
              <img 
                src={`http://localhost:8000/${post.postImage}`}  // Update the image source with the correct path
                alt="Post" 
                className="post-image" 
              />
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
