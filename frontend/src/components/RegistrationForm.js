import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate for navigation

const RegistrationForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);  // State to store the error message
  const navigate = useNavigate();  // Initialize navigate for redirecting users

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send the registration request to the backend
      const response = await axios.post('http://localhost:5000/register', {
        username,
        password,
      });

      // If registration is successful, redirect to the home page
      if (response.status === 201) {
        navigate('/');  // Redirect to the Home page
      }
    } catch (error) {
      // If there is an error, set the error state to display the error message
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Register</button>
      
      {/* Display error message if registration fails */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default RegistrationForm;
