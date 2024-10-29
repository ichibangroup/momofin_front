import React, { useState } from 'react';

const EditUserOrgProfile = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    name: '',
    position: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="edit-user-org-profile">
      <h1>Edit User Organisation Profile</h1>
      <form onSubmit={handleSubmit}>
        {['username', 'email', 'oldPassword', 'newPassword', 'name', 'position'].map((field) => (
          <div key={field}>
            <label htmlFor={field}>{field.replace(/([A-Z])/g, ' $1')}: </label>
            <input
              id={field}
              name={field}
              type={field.includes('Password') ? 'password' : 'text'}
              value={formData[field]}
              onChange={handleChange}
            />
          </div>
        ))}
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditUserOrgProfile;
