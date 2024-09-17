import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserDashboard = ({ token, setToken, setRole }) => {
  const [user, setUser] = useState({ username: '' });
  const navigate = useNavigate();  // Use for redirection

  useEffect(() => {
    // Fetch user data when the component loads
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);  // Set the user data (username, etc.)
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, [token]);

  // Handle Logout
  const handleLogout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');  // Clear token from localStorage
    localStorage.removeItem('role');   // Clear role from localStorage
    navigate('/login');  // Redirect to login page
  };

  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
      <p>User Dashboard</p>
      
      {/* Logout button */}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default UserDashboard;
