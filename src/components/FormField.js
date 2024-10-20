// src/components/FormField.jsx
import React from 'react';
import PropTypes from 'prop-types';

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

export default FormField;