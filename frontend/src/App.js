import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Home from './components/Home';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [username, setUsername] = useState('');

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    setUsername(''); // Reset username on logout
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<LoginForm setToken={setToken} setRole={setRole} setUsername={setUsername} />} />
        {role === 'admin' ? (
          <Route path="/dashboard" element={<AdminDashboard token={token} setToken={setToken} setRole={setRole} handleLogout={handleLogout} />} />
        ) : (
          <Route path="/user-dashboard" element={<UserDashboard username={username} token={token} setToken={setToken} setRole={setRole} handleLogout={handleLogout} />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
