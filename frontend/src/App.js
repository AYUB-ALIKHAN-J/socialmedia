import './App.css';
import Login from './components/Login/Login';
import HomePage from './components/HomePage/HomePage';
import Profile from './components/Profile/Profile';
import KnowledgeHub from './components/KnowledgeHub/KnowledgeHub';
import StudyGroup from './components/StudyGroup/StudyGroup';
import Post from './components/Post/Post';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> {/* Route for the Login page */}
        <Route path="/home" element={<HomePage />} /> {/* Route for the Home page */}
        <Route path="/profile" element={<Profile />} /> {/* Route for the Profile page */}
        <Route path="/knowledge-hub" element={<KnowledgeHub />} /> {/* Route for the Knowledge Hub page */}
        <Route path="/study-group" element={<StudyGroup />} /> {/* Route for the Study Group page */}
        <Route path="/new-post" element={<Post />} />
        
         {/* Route for the Logout page */}
      </Routes>
    </Router>
  );
}

export default App;
