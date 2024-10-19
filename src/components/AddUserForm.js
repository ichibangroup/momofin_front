import React, { useState } from 'react';
import api from '../utils/api'; // Assuming this is the correct path to your api file

const AddUserForm = ({ title, onSubmit }) => {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    position: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validation rules
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password || formData.password.length < 10) newErrors.password = 'Password must be at least 10 characters';
    if (!formData.email.includes('@')) newErrors.email = 'Email is invalid';
    if (!formData.position.trim()) newErrors.position = 'Position is required';

    setErrors(newErrors);

    // Return whether the form is valid
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return; // Stop form submission if validation fails
    }

    try {
      const response = await api.post('/auth/register', formData);

      if (response.status === 200) {
        // Clear form
        setFormData({
          name: '',
          username: '',
          password: '',
          email: '',
          position: ''
        });

        // You might want to add success message handling here
        alert('Registration successful!');
      }
    } catch (error) {
      // Handle errors
      console.error('Registration error:', error);
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
      <div className="container mt-5">
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name:</label>
                <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Username:</label>
                <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password:</label>
                <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email:</label>
                <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="position" className="form-label">Position:</label>
                <input
                    type="text"
                    className="form-control"
                    id="position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Register User
              </button>
            </form>
          </div>
        </div>
      </div>
  );
};

export default AddUserForm;