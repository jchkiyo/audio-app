import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';  // Import Link for navigation

const LoginForm = ({ setToken, setRole }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();  // Initialize navigate for redirecting users

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send the login request to the backend
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password,
      });

      // Store the token and role
      const { token, role } = response.data;
      setToken(token);
      setRole(role);

      // Redirect based on the role
      if (role === 'admin') {
        navigate('/dashboard');  // Redirect to the admin dashboard for admin
      } else {
        navigate('/user-dashboard');  // Redirect to the user dashboard for regular users
      }
    } catch (error) {
      console.error('Login failed:', error);
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
      <button type="submit">Login</button>
      
      {/* Add a Register button */}
      <div>
        <p>Don't have an account?</p>
        <Link to="/register">
          <button type="button">Register</button>
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
