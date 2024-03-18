import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css'; 
import { validate } from 'uuid';

const LoginForm = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    // Probna avtentikacija
    const validUsername = 'davidnnv';
    const validPassword = 'proba';

    setIsLoading(true);

   
    setTimeout(() => {
      if (username === validUsername && password === validPassword) {
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        navigate('/home');
      } else {
        setError('Invalid username or password. Please try again.');
        setIsLoading(false); //Resetiranje na loading stejtot
      }
    }, 1500);
  };
  
  return (
    <div>
      <p>FOOD TRACKER APP</p>
      <h1>Login</h1>
      <div>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default LoginForm;
