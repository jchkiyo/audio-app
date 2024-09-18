import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/AdminDashboard.css"; // Ensure to import the CSS for styling

const AdminDashboard = ({ token, setToken, setRole }) => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [editUser, setEditUser] = useState(null);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false); // State for form visibility
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
      setNewUser({ username: "", password: "" });
      setIsCreating(false); // Hide the form after creating
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

  const columns = useMemo(
    () => [
      { Header: "Username", accessor: "username" },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <div>
            <button
              className="edit-button"
              onClick={() => setEditUser(row.original)}
            >
              Edit
            </button>
            <button
              className="delete-button"
              onClick={() => handleDeleteUser(row.original.id)}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Admin Dashboard</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="button-container">
        <button
          className="create-button"
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? "Cancel" : "Create New User"}
        </button>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.accessor}>{column.Header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>
                  <button
                    className="edit-button"
                    onClick={() => setEditUser(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateUser} className="create-user-section">
          <h3>Create New User</h3>
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
          <button type="submit">Create User</button>
        </form>
      )}

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
          />
          <button type="submit">Update User</button>
          <button type="button" onClick={() => setEditUser(null)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminDashboard;
