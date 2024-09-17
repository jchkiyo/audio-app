import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = ({ token, setToken, setRole }) => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [editUser, setEditUser] = useState(null);  // User being edited
  const [error, setError] = useState('');
  const navigate = useNavigate();  // Use navigate for redirection

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Fetch users from the backend
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  // Handle creating a new user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/admin/users', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();  // Refresh the user list
      setNewUser({ username: '', password: '' });  // Reset form
    } catch (err) {
      setError('Failed to create user');
    }
  };

  // Handle updating a user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/admin/users/${editUser.id}`, editUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();  // Refresh the user list
      setEditUser(null);  // Reset edit state
    } catch (err) {
      setError('Failed to update user');
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();  // Refresh the user list
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');  // Redirect to the login page
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Logout Button */}
      <button onClick={handleLogout}>Logout</button>

      {/* Table of users */}
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Password</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.password}</td>
              <td>
                <button onClick={() => setEditUser(user)}>Edit</button>
                <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit user form */}
      {editUser && (
        <form onSubmit={handleUpdateUser}>
          <h3>Edit User</h3>
          <input
            type="text"
            placeholder="Username"
            value={editUser.username}
            onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={editUser.password}
            onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
          />
          <button type="submit">Update User</button>
          <button type="button" onClick={() => setEditUser(null)}>Cancel</button>
        </form>
      )}

      {/* Form to create a new user */}
      <h3>Create New User</h3>
      <form onSubmit={handleCreateUser}>
        <input
          type="text"
          placeholder="Username"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />
        <button type="submit">Create User</button>
      </form>
    </div>
  );
};

export default AdminDashboard;
