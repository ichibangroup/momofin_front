import React, { useState } from 'react';
import api from '../utils/api';
import FormField from "./FormField";
import { sanitizeFormData, sanitizePlainText } from '../utils/sanitizer';

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
    // Sanitize input as it comes in
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

    // Sanitize values before validation
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
      // Sanitize all form data before sending to API
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
      // Sanitize error message before displaying
      const errorMessage = error.response?.data?.message || 'Registration failed';
      alert(sanitizePlainText(errorMessage));
    }
  };

  return (
    <div className="container mx-auto mt-8 max-w-2xl">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">{sanitizePlainText(title)}</h1>
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