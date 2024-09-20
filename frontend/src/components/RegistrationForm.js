import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./css/RegistrationForm.css"; // Import the CSS for styling

const RegistrationForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL; // Get the API URL from environment variable

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/register`, {
        // Updated URL
        username,
        password,
      });
      // Handle successful registration
      alert("Registration successful!"); // Prompt success message
      navigate("/login"); // Navigate back to the login page
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed."); // Show the error message
    }
  };

  const handleBack = () => {
    navigate("/login"); // Navigate back to the login page
  };

  return (
    <div className="container-registration">
      <h1>Registration Form</h1>
      <form onSubmit={handleSubmit} className="registration-form">
        <div className="input-container">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="registration-input"
          />
        </div>

        <div className="input-container">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="registration-input"
          />
        </div>

        <div className="button-container-3">
          <button type="button" onClick={handleBack} className="back-button">
            Back
          </button>
          <button type="submit" className="registration-button">
            Register
          </button>
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
};

export default RegistrationForm;
