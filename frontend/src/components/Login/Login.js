import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing
import './Login.css';

const Login = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [mail, setMail] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const navigate = useNavigate(); // Use navigate hook for programmatic navigation

  // Handle login request
  const handleLogin = (e) => {
    e.preventDefault();

    // Send login data to the backend
    axios.post('http://127.0.0.1:8000/login', { user, pass })
      .then((response) => {
        console.log(response.data); // Log the full response data for debugging
        if (response.data.message === "Login successful") {
          // Store username in localStorage
          localStorage.setItem('username', response.data.user);
          // Navigate to the home page
          navigate('/home');
          alert("Login successful!"); // Show success message
        } else {
          alert(response.data.message); // Show error message
        }
      })
      .catch((error) => {
        console.error('Error during login:', error);
        alert('An error occurred during login. Please try again.'); // User-friendly error message
      });
  };

  // Handle signup request
  const handleSignup = (e) => {
    e.preventDefault();
    if (user === '' || pass === '' || mail === '' || bio === '') {
      alert("Required fields are empty");
    } else {
      const formData = new FormData();
      formData.append("name", user);
      formData.append("pass", pass);
      formData.append("mail", mail);
      formData.append("bio", bio);
      if (profilePic) {
        formData.append("profilePic", profilePic);
      }

      // Send signup data to the backend
      axios.post('http://127.0.0.1:8000/receive-data', formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      .then(response => {
        console.log('User created:', response);
        alert("Signup successful!");
      })
      .catch(error => {
        console.error('Error during signup:', error);
      });
    }
  };

  const handleProfilePicChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
  };

  return (
    <div className="container-fluid bg">
      {isLoginView ? (
        <div className="container auth">
          <form onSubmit={handleLogin}>
            <h1>Login</h1>
            <input
              type="text"
              className="inp"
              placeholder="Username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
            />
            <input
              type="password"
              className="inp"
              placeholder="Password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />
            <button type="submit" className="logbtn">Login</button>
            <p>Don't have an account?<a onClick={toggleView}> Signup</a></p>
          </form>
        </div>
      ) : (
        <div className="container new">
          <form onSubmit={handleSignup}>
            <h1>Signup</h1>
            <input
              type="text"
              className="inpu"
              placeholder="Username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
            />
            <input
              type="password"
              className="inpu"
              placeholder="Password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />
            <input
              type="email"
              className="inpu"
              placeholder="Email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              required
            />
            <textarea
              className="inpu"
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
            />
            <input
              type="file"
              className="inpu"
              onChange={handleProfilePicChange}
              accept="image/*"
            />
            <button type="submit" className="signbtn">Signup</button>
            <p>Already have an account?<a onClick={toggleView}> Login</a></p>
          </form>
        </div>
      )}
    </div>
  );
};

export default Login;
