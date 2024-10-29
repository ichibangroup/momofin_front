import React, { useState } from 'react';

const FormField = ({ label, id, name, type = 'text', value, onChange }) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
    />
  </div>
);

const EditUserOrgProfile = () => {
  const [user, setUser] = useState({
    username: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    name: '',
    position: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', user);
  };

  return (
    <div className="edit-user-org-profile">
      <h1>Edit User Organisation Profile</h1>
      <form onSubmit={handleSubmit}>
        <FormField
          label="Username:"
          id="username"
          name="username"
          value={user.username}
          onChange={handleInputChange}
        />
        <FormField
          label="Email:"
          id="email"
          name="email"
          type="email"
          value={user.email}
          onChange={handleInputChange}
        />
        <FormField
          label="Old Password:"
          id="oldPassword"
          name="oldPassword"
          type="password"
          value={user.oldPassword}
          onChange={handleInputChange}
        />
        <FormField
          label="New Password:"
          id="newPassword"
          name="newPassword"
          type="password"
          value={user.newPassword}
          onChange={handleInputChange}
        />
        <FormField
          label="Name:"
          id="name"
          name="name"
          value={user.name}
          onChange={handleInputChange}
        />
        <FormField
          label="Position:"
          id="position"
          name="position"
          value={user.position}
          onChange={handleInputChange}
        />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditUserOrgProfile;
