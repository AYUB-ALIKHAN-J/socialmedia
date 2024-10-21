import React from 'react';
import Navbar from '../Navbar/Navbar';
import './KnowledgeHub.css';

const KnowledgeHub = () => {
  return (
    <div className="container">
      <Navbar />
      <div className="knowledge-hub-content">
        <h1>Knowledge Hub Page</h1>
        {/* Add your knowledge hub content here */}
      </div>
    </div>
  );
};

export default KnowledgeHub;