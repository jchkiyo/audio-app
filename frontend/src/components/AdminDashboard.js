import React, { useEffect, useState } from 'react';
import axios from 'axios';



const AdminDashboard = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all users for the admin dashboard
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/admin', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
      } catch (err) {
        setError('Error fetching users.');
        console.error(err);
      }
    };

    fetchUsers();
  }, [token]);

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      setError('Error deleting user.');
      console.error(err);
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => handleDelete(user.id)}>Delete</button>
                {/* Add update functionality here */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
