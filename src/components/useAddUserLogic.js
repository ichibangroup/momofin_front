import { useState } from 'react';

const useAddUserLogic = () => {
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

  return { username, password, email, position, handleSubmit };
};

export default useAddUserLogic;