import React from 'react';
import './Navbar.css';
import { FaHome, FaUser, FaBook, FaUsers, FaSignOutAlt, FaPlusCircle } from 'react-icons/fa';

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <a href="/home">
            <FaHome className="icon" />
            Home
          </a>
        </li>
        <li>
          <a href="/profile">
            <FaUser className="icon" />
            My Profile
          </a>
        </li>
        <li>
          <a href="/knowledge-hub">
            <FaBook className="icon" />
            Knowledge Hub
          </a>
        </li>
        <li>
          <a href="/study-group">
            <FaUsers className="icon" />
            Study Group
          </a>
        </li>
        <li>
          <a href="/new-post">
            <FaPlusCircle className="icon" />
            Add New Post
          </a>
        </li>
        <li>
          <a href="/">
            <FaSignOutAlt className="icon" />
            Logout
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
