import React, { useEffect, useState } from 'react';
import './ViewOrganisationUsers.css';
import {Link, useParams} from 'react-router-dom';
import api from "../utils/api";


const ViewUsers = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([

  ]);

  // Replace this with a function to fetch user data from your backend
  useEffect(() => {
    const fetchOrganizationUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/organizations/${id}/users`);
        setUsers(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch organisation users');
        console.error('Error fetching organisation users:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrganizationUsers();
    }
  }, [id]);

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
              <td><img src={user.avatar} alt={user.username} className="user-avatar" /></td>
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
        <Link to={`/app/configOrganisation/${id}/addUserOrgAdmin`}>ADD USER</Link>
    </button>
    </div>
  );
};

export default ViewUsers;