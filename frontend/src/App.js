import './App.css';
import Login from './components/Login/Login';
import HomePage from './components/HomePage/HomePage';
import Profile from './components/Profile/Profile';
import KnowledgeHub from './components/KnowledgeHub/KnowledgeHub';
import StudyGroup from './components/StudyGroup/StudyGroup';
import Post from './components/Post/Post';
import Navbar from './components/Navbar/Navbar'; // Import Navbar component
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

// Wrapper component to conditionally show Navbar
const NavbarWrapper = ({ children }) => {
  const location = useLocation();
  const noNavbarRoutes = ['/', '/sign-up']; // Define routes where Navbar shouldn't appear

  return (
    <>
      {!noNavbarRoutes.includes(location.pathname) && <Navbar />} {/* Show Navbar except on login and sign-up */}
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <NavbarWrapper>
        <Routes>
          <Route path="/" element={<Login />} /> {/* Route for the Login page */}
          <Route path="/home" element={<HomePage />} /> {/* Route for the Home page */}
          <Route path="/profile" element={<Profile />} /> {/* Route for the Profile page */}
          <Route path="/knowledge-hub" element={<KnowledgeHub />} /> {/* Route for the Knowledge Hub page */}
          <Route path="/study-group" element={<StudyGroup />} /> {/* Route for the Study Group page */}
          <Route path="/new-post" element={<Post />} /> {/* Route for creating new posts */}
        </Routes>
      </NavbarWrapper>
    </Router>
  );
}

export default App;
