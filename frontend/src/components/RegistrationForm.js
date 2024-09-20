import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./css/RegistrationForm.css"; // Import the CSS for styling

const RegistrationForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/register", {
        username,
        password,
      });

      if (response.status === 201) {
        navigate("/"); // Redirect to the Home page
      }
    } catch (error) {
      setError("Registration failed. Please try again.");
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

        <div clasName="button-container">
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
