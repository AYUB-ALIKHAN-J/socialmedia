import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import axios here
import Navbar from '../Navbar/Navbar';

const HomePage = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/current-user'); // Adjust your endpoint as necessary
        setCurrentUser(response.data.user); // Assuming your response has the user data in this structure
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div>
      <Navbar currentUser={currentUser} />
      <div className="home-content">
        <h1>Welcome, {currentUser ? currentUser.name : 'Guest'}!</h1>
        {/* Your other home page content here */}
      </div>
    </div>
  );
};

export default HomePage;
