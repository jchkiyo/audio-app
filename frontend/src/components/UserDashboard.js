import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserDashboard = ({ token }) => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Fetch user information
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('http://localhost:5000/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserInfo(response.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, [token]);

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome to the User Dashboard, {userInfo.username}!</h1>
      <p>Your role: {userInfo.role}</p>
      {/* You can add more details here like account info, recent activity, etc. */}
    </div>
  );
};

export default UserDashboard;
