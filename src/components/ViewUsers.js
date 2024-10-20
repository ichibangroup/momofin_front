import React, { useEffect, useState } from 'react';
import './ViewUsers.css';
import api from "../utils/api";

const ViewUsers = () => {
  const [, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [users, setUsers] = useState([

  ]);

  // Replace this with a function to fetch user data from your backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/momofin-admin/users');
      setUsers(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="view-users" data-testid="viewUsers-1">
      <h1 className="title">View All Users</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Username</th>
            <th>Organization</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td><img src={user.avatar} alt={user.username} className="user-avatar" /></td>
              <td>{user.name}</td>
              <td>{user.username}</td>
              <td>{user.organization}</td>
              <td>{user.email}</td>
              <td>
                 <button className="edit-button">EDIT</button>
                <button className="delete-button">DELETE</button>
            </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewUsers;