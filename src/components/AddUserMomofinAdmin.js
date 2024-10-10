import React from 'react';
import AddUserForm from './AddUserForm';
import useAddUserLogic from './useAddUserLogic';

const AddUserMomofinAdmin = () => {
  const { handleSubmit } = useAddUserLogic();

  return (
    <AddUserForm title="Add User (Momofin Admin)" onSubmit={handleSubmit} />
  );
};

export default AddUserMomofinAdmin;