import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';
import { FaUserFriends, FaUsers } from 'react-icons/fa';

const Profile = () => {
  const [profileData, setProfileData] = useState({ username: '', profilePic: '', bio: '' });
  const [userPosts, setUserPosts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [newComment, setNewComment] = useState({});
  const [followCount, setFollowCount] = useState({ followingCount: 0, followersCount: 0 });
  const [userProfile, setUserProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      const savedUsername = localStorage.getItem('username');
      setCurrentUser(savedUsername);

      try {
        const profileResponse = await axios.get(`http://127.0.0.1:8000/profile/${savedUsername}`);
        setProfileData(profileResponse.data);

        const postsResponse = await axios.get(`http://127.0.0.1:8000/user-posts/${savedUsername}`);
        setUserPosts(postsResponse.data);

        // Fetch follow count
        const followCountResponse = await axios.get(`http://127.0.0.1:8000/follow-count/${savedUsername}`);
        setFollowCount(followCountResponse.data);

        const response = await axios.get(`http://127.0.0.1:8000/profile/${savedUsername}`);
        setUserProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    fetchProfileData();
  }, []);

  const handleProfileUpdate = async () => {
    const formData = new FormData();
    formData.append('bio', newBio);
    if (newProfilePic) {
      formData.append('profilePic', newProfilePic);
    }
    try {
      const savedUsername = localStorage.getItem('username');
      const response = await axios.put(`http://127.0.0.1:8000/edit-profile/${savedUsername}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfileData(response.data.user);
      setEditMode(false);
      setNewBio('');
      setNewProfilePic(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleAddComment = async (postId) => {
    if (!newComment[postId]?.trim()) return;

    try {
      await axios.post(`http://127.0.0.1:8000/comment-post/${postId}`, { 
        username: profileData.username, 
        comment: newComment[postId] 
      });
      setUserPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...post.comments, { username: profileData.username, comment: newComment[postId] }] }
            : post
        )
      );
      setNewComment((prev) => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/posts/${postId}`);
      setUserPosts((posts) => posts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleCommentChange = (postId, text) => {
    setNewComment((prev) => ({ ...prev, [postId]: text }));
  };

  if (!userProfile) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={profileData.profilePic} alt="Profile" className="profile-pic" />
        <h1>{profileData.username}</h1>
        <p>{profileData.bio}</p>
        <button onClick={() => setEditMode(true)} className="edit-profile-btn">Edit Profile</button>
        <div className="follow-info">
          <div>
            <FaUsers /> {followCount.followersCount} Followers
          </div>
          <div>
            <FaUserFriends /> {followCount.followingCount} Following
          </div>
        </div>
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
          <button onClick={handleProfileUpdate} className="save-btn">Save</button>
          <button onClick={() => setEditMode(false)} className="cancel-btn">Cancel</button>
        </div>
      )}

      <div className="posts-section">
        {userPosts.length === 0 ? (
          <p>No posts to show</p>
        ) : (
          userPosts.map((post) => (
            <div key={post._id} className="post-card">
              <img 
                src={`http://localhost:8000/${post.postImage}`} 
                alt="Post" 
                className="post-image" 
              />
              <div className="post-details">
                <h2>{post.caption}</h2>
                <p>Likes: {post.likes.length}</p>
                <p>Comments: {post.comments.length}</p>

                <div className="comments-section">
                  {post.comments.map((comment, idx) => (
                    <p key={idx}><strong>{comment.username}</strong>: {comment.comment}</p>
                  ))}
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment[post._id] || ''}
                    onChange={(e) => handleCommentChange(post._id, e.target.value)}
                  />
                  <button onClick={() => handleAddComment(post._id)}>Comment</button>
                </div>

                <button onClick={() => handleDeletePost(post._id)} className="delete-post-button">Delete Post</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
