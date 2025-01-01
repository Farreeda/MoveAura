import React, { useState } from 'react';
import './Login.css';  // Optional: Style for the login form

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5009/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Login successful!');
        setIsAuthenticated(true);
        setToken(data.token); // Store JWT token
        localStorage.setItem('token', data.token); // Optionally save token in localStorage
      } else {
        setMessage(data.message || 'Login failed!');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>

      {message && <p className="message">{message}</p>}

      {isAuthenticated && (
        <div className="success">
          <h4>Login Successful!</h4>
          <p>Your token: {token}</p>
        </div>
      )}
          <div>
              Already have an account? <button onClick={() => window.location.href = '/login'}>Log in</button>
          </div>
          <div>
              Are you a service provider? <button onClick={() => window.location.href = '/splogin'}>Log in here</button>
          </div>
      </div>
  );
};

export default Login;