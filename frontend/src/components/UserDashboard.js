import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = ({ username, setToken, setRole }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/'); // Redirect to home page
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome, {username ? username : 'Guest'}!</h1>
      <p>Here you can manage your audio files and settings.</p>
      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
};

export default UserDashboard;
