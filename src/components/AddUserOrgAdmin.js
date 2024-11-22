import React from 'react';
import AddUserForm from './AddUserForm';
import useAddUserLogic from './useAddUserLogic';

const AddUserOrgAdmin = () => {
  const { handleSubmit } = useAddUserLogic();

  return (
    <AddUserForm title="Add User" onSubmit={handleSubmit} />
  );
};

export default AddUserOrgAdmin;