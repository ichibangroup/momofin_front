import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../ViewDocuments.css';

function Page() {
  const [users, setUsers] = useState([]); 
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    handleGetUsers();
  }, []);

  const handleGetUsers = async () => {
    try {
      const response = await api.get('/doc/view');
      setUsers(response.data.documents);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleSearch = (e) => {
    setKeyword(e.target.value);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Your Documents</h1>
      <input
        type="text"
        className="search-input"
        placeholder="Search File Name"
        value={keyword}
        onChange={handleSearch}
      />
      <table className="users-table">
        <thead>
          <tr>
            <th>File Names</th>
          </tr>
        </thead>
        <tbody>
          {users.filter(user => user.name.includes(keyword)).map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Page;
