import React, { useState } from 'react';
import api from '../utils/api';
import { sanitizeFormData, sanitizePlainText } from '../utils/sanitizer';
import './AddUserForm.css';

const FormField = ({ label, id, type = 'text', value, onChange, error }) => (
  <div className="form-field">
    <label className="form-label" htmlFor={id}>{label}</label>
    <input
      className="form-input"
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={onChange}
    />
    {error && <span className="form-error">{error}</span>}
  </div>
);

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
    const { id, value } = e.target;
    const sanitizedValue = sanitizePlainText(value);
    setFormData(prev => ({
      ...prev,
      [id]: sanitizedValue
    }));

    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const sanitizedData = sanitizeFormData(formData);

    if (!sanitizedData.name.trim()) newErrors.name = 'Name is required';
    if (!sanitizedData.username.trim()) newErrors.username = 'Username is required';
    if (!sanitizedData.password || sanitizedData.password.length < 10) newErrors.password = 'Password must be at least 10 characters';
    if (!sanitizedData.email.includes('@')) newErrors.email = 'Email is invalid';
    if (!sanitizedData.position.trim()) newErrors.position = 'Position is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const sanitizedFormData = sanitizeFormData(formData);
      const response = await api.post('/auth/register', sanitizedFormData);

      if (response.status === 200) {
        setFormData({
          name: '',
          username: '',
          password: '',
          email: '',
          position: ''
        });
        alert('Registration successful!');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      alert(sanitizePlainText(errorMessage));
    }
  };

  return (
    <div className="add-user-container">
      <div className="decorative-lines"></div>
      <div className="add-user-content">
        <h1 className="page-title">{sanitizePlainText(title)}</h1>
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-row">
            <FormField
              label="Name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />
            <FormField
              label="Username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
            />
          </div>
          
          <div className="form-row">
            <FormField
              label="Position"
              id="position"
              value={formData.position}
              onChange={handleChange}
              error={errors.position}
            />
            <FormField
              label="Email"
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
          </div>

          <div className="password-section">
            <FormField
              label="Password"
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />
          </div>

          <div className="button-container">
            <button type="button" className="button button-secondary">
              Cancel
            </button>
            <button type="submit" className="button button-primary">
              Register User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;