import React, { useState } from 'react';
import './Navbar.css';
import { FaHome, FaUser, FaBook, FaUsers, FaPlusCircle, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const [active, setActive] = useState(null); // Initialize active as null to remove the default home active

  const handleSetActive = (page) => {
    setActive(page);
  };

  return (
    <nav className="navbar">
      <ul>
        <li className={active === 'home' ? 'active' : ''} onClick={() => handleSetActive('home')}>
          <a href="/home">
            <FaHome className="icon" />
          </a>
        </li>
        <li className={active === 'profile' ? 'active' : ''} onClick={() => handleSetActive('profile')}>
          <a href="/profile">
            <FaUser className="icon" />
          </a>
        </li>
        <li className={active === 'knowledge-hub' ? 'active' : ''} onClick={() => handleSetActive('knowledge-hub')}>
          <a href="/knowledge-hub">
            <FaBook className="icon" />
          </a>
        </li>
        <li className={active === 'study-group' ? 'active' : ''} onClick={() => handleSetActive('study-group')}>
          <a href="/study-group">
            <FaUsers className="icon" />
          </a>
        </li>
        <li className={active === 'new-post' ? 'active' : ''} onClick={() => handleSetActive('new-post')}>
          <a href="/new-post">
            <FaPlusCircle className="icon" />
          </a>
        </li>
        <li onClick={() => setActive('logout')}>
          <a href="/">
            <FaSignOutAlt className="icon" />
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;