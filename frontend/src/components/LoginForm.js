import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./css/LoginForm.css"; // Import CSS for styling

const LoginForm = ({ setToken, setRole, setUsername }) => {
  const [username, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });

      const { token, role, username: loggedInUsername } = response.data;
      setToken(token);
      setRole(role);
      setUsername(loggedInUsername);

      // Navigate based on user role
      if (role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="container">
      <h1>Login Form</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-container">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="Username"
            required
            className="login-input"
          />
        </div>
        <div className="input-container">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="login-input"
          />
        </div>
        <button type="submit" className="login-button">
          Login
        </button>

        <div className="register-prompt">
          <p>Don't have an account?</p>
          <Link to="/register">
            <button type="button" className="register-button">
              Register
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
