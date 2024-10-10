import React, { useEffect, useState } from 'react';
import './ViewOrganisationUsers.css';
import { Link } from 'react-router-dom';


const ViewUsers = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Galih Ibrahim Kurniawan',
      username: 'Sirered',
      position: 'CHIEF EXECUTIVE OFFICER',
      email: 'emailme@example.com',
      avatar: 'https://randomuser.me/api/portraits/men/79.jpg', // Replace with actual avatar URL
      organisation: 'ICHIBAN GROUP',
    },
    // Add more users here
  ]);

  // Replace this with a function to fetch user data from your backend
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://your-api-endpoint/users'); // Replace with your API endpoint
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="view-users" data-testid="viewUsers-1">
      <h1 className="title">View All Organisation Users</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Username</th>
            <th>Position</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td><img src={user.avatar} alt={user.name} className="user-avatar" /></td>
              <td>{user.name}</td>
              <td>{user.username}</td>
              <td>{user.position}</td>
              <td>{user.email}</td>
              <td>
                <button className="admin-button">MAKE ADMIN</button>
                <button className="edit-button">EDIT</button>
                <button className="delete-button">DELETE</button>
            </td>
            </tr>
          ))}
        </tbody>
      </table>
    <button className="add-users-button">
        <Link to="/app/configOrganisation/addUserOrgAdmin">ADD USER</Link>
    </button>
    </div>
  );
};

export default ViewUsers;