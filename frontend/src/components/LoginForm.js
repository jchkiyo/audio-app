import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const LoginForm = ({ setToken, setRole, setUsername }) => {
  const [username, setUsernameInput] = useState(''); // Use setUsernameInput for state
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password,
      });

      const { token, role, username: loggedInUsername } = response.data; // Ensure you get the username
      setToken(token);
      setRole(role);
      setUsername(loggedInUsername); // Set the username in the parent component's state

      // Navigate based on user role
      if (role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/user-dashboard'); // No need to pass username in state, it's now in context
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
        onChange={(e) => setUsernameInput(e.target.value)} // Update state with input value
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
