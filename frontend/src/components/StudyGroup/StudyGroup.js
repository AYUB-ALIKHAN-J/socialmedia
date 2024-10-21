import React from 'react';
import Navbar from '../Navbar/Navbar';
import './StudyGroup.css';

const StudyGroup = () => {
  return (
    <div className="container">
      <Navbar />
      <div className="study-group-content">
        <h1>Study Group Page</h1>
        {/* Add your study group content here */}
      </div>
    </div>
  );
};

export default StudyGroup;