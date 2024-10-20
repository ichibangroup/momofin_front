import React, { useState } from 'react';
import api from '../utils/api';
import PropTypes from 'prop-types';

// Move FormField outside the main component
const FormField = ({ id, label, type = 'text', value, onChange, error }) => (
    <div className="mb-3">
      <label htmlFor={id} className="block mb-1 font-medium">
        {label}:
      </label>
      <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          className={`w-full p-2 border rounded ${error ? 'border-red-500' : 'border-gray-300'}`}
      />
      {error && (
          <p className="mt-1 text-sm text-red-500">
            {error}
          </p>
      )}
    </div>
);

FormField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['text', 'password', 'email', 'number', 'tel', 'url']),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string
};

FormField.defaultProps = {
  type: 'text',
  error: null
};

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
    setFormData(prev => ({
      ...prev,
      [id]: value
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

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password || formData.password.length < 10) newErrors.password = 'Password must be at least 10 characters';
    if (!formData.email.includes('@')) newErrors.email = 'Email is invalid';
    if (!formData.position.trim()) newErrors.position = 'Position is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await api.post('/auth/register', formData);

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
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
      <div className="container mx-auto mt-8 max-w-2xl">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6">{title}</h1>
          <form onSubmit={handleSubmit}>
            <FormField
                id="name"
                label="Name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
            />
            <FormField
                id="username"
                label="Username"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
            />
            <FormField
                id="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
            />
            <FormField
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
            />
            <FormField
                id="position"
                label="Position"
                value={formData.position}
                onChange={handleChange}
                error={errors.position}
            />

            <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Register User
            </button>
          </form>
        </div>
      </div>
  );
};

export default AddUserForm;