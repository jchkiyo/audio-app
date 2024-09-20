import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./css/AdminDashboard.css"; // Ensure to import the CSS for styling

const AdminDashboard = ({ token, setToken, setRole }) => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user",
  });
  const [editUser, setEditUser] = useState(null);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/admin/users", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      setNewUser({ username: "", password: "", role: "user" });
      setShowCreateForm(false);
    } catch (err) {
      setError("Failed to create user");
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/admin/users/${editUser.id}`,
        editUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUsers();
      setEditUser(null);
    } catch (err) {
      setError("Failed to update user");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Function to randomly mask the password
  const randomMaskPassword = (password) => {
    if (!password || password.length < 2) return password; // Return as is if too short

    const length = password.length;
    const maskedPassword = password.split("").map((char, index) => {
      // Randomly decide to mask or reveal
      return Math.random() < 0.5 ? "*" : char; // 50% chance to mask
    });

    // Ensure at least the first and last characters are revealed
    maskedPassword[0] = password[0];
    maskedPassword[length - 1] = password[length - 1];

    return maskedPassword.join("");
  };

  // Filter users based on search term
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate users into admins and regular users
  const adminUsers = filteredUsers.filter((user) => user.role === "admin");
  const regularUsers = filteredUsers.filter((user) => user.role === "user");

  return (
    <div className="wrap">
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>

      <div className="outer-container">
        <div className="admin-container">
          <h1>Admin Dashboard</h1>

          {error && <p style={{ color: "red" }}>{error}</p>}

          {/* Admin Users Table */}
          <h2>Admin Users</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Password</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{randomMaskPassword(user.password)}</td>{" "}
                    {/* Masked Password */}
                    <td>
                      <button
                        onClick={() => setEditUser(user)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="regular-user-container">
            <h2>Regular Users</h2>
            <div className="admin-actions">
              <input
                type="text"
                placeholder="Search by username"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="action-button-create-user"
              >
                Create User
              </button>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Password</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {regularUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{randomMaskPassword(user.password)}</td>{" "}
                    {/* Masked Password */}
                    <td>
                      <button
                        onClick={() => setEditUser(user)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {editUser && (
            <form onSubmit={handleUpdateUser}>
              <h3>Edit User</h3>
              <input
                type="text"
                placeholder="Username"
                value={editUser.username}
                onChange={(e) =>
                  setEditUser({ ...editUser, username: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Password"
                value={editUser.password}
                onChange={(e) =>
                  setEditUser({ ...editUser, password: e.target.value })
                }
              />{" "}
              {/* Add this div for button styling */}
              <button type="submit" className="edit-user-button">
                Update User
              </button>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="cancel-edit-button"
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        {/* Create User Form inside the wrap container */}
        {showCreateForm && (
          <div className="create-user-form">
            <h3>Create New User</h3>
            <form onSubmit={handleCreateUser}>
              <input
                type="text"
                placeholder="Username"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
              />
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="create-user-button">
                Create User
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
