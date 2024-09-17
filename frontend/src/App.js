import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Home from './components/Home';  // Import the Home component

function App() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />  {/* Default route */}
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<LoginForm setToken={setToken} setRole={setRole} />} />
        <Route path="/dashboard" element={role === 'admin' ? <AdminDashboard token={token} /> : <UserDashboard token={token} />} />
      </Routes>
    </Router>
  );
}

export default App;
