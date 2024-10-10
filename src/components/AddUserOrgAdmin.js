import React, { useState } from 'react';
import AddUserForm from './AddUserForm'; 

const AddUserOrgAdmin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Implement logic to submit user data
    console.log('Submitted user data:', { username, password, email, position });
    // Clear form after submit
    setUsername('');
    setPassword('');
    setEmail('');
    setPosition('');
  };

  return (
    <AddUserForm title="Add User (Momofin Admin)" onSubmit={handleSubmit} />
  );
};

export default AddUserOrgAdmin;