import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Home from './components/Home';  // Import the Home component
import UploadAudio from './components/UploadAudio';  // Import the UploadAudio component
import UserAudioList from './components/UserAudioList';  // Import the UserAudioList component

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />  {/* Default route */}
        <Route path="/register" element={<RegistrationForm />} />  {/* Registration page */}
        <Route path="/login" element={<LoginForm setToken={setToken} setRole={setRole} />} />  {/* Login page */}

        {/* Conditionally render based on role */}
        {role === 'admin' ? (
          <Route
            path="/dashboard"
            element={<AdminDashboard token={token} setToken={setToken} setRole={setRole} handleLogout={handleLogout} />}
          />
        ) : (
          <Route
            path="/user-dashboard"
            element={<UserDashboard token={token} setToken={setToken} setRole={setRole} handleLogout={handleLogout} />}
          />
        )}

        {/* Routes for uploading and viewing audio files */}
        <Route path="/upload-audio" element={<UploadAudio token={token} />} />  {/* Audio upload page */}
        <Route path="/my-audio" element={<UserAudioList token={token} />} />  {/* User audio files page */}
      </Routes>
    </Router>
  );
}

export default App;
