import React from 'react';
import Navbar from '../Navbar/Navbar';
import './Profile.css';

const Profile = () => {
  return (
    <div className="container">
      <Navbar />
      <div className="profile-content">
        <h1>Profile Page</h1>
        {/* Add your profile content here */}
      </div>
    </div>
  );
};

export default Profile;