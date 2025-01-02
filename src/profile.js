import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For redirecting to another page
import axios from 'axios'; // For making HTTP requests to the backend

const ProfileButton = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate(); // For navigation

  // Check if JWT token exists in localStorage
  const token = localStorage.getItem('token');

  useEffect(() => {
    // If token exists, check if the user is logged in
    if (token) {
      // Make an API call to fetch user data (e.g., username) if token is present
      axios.get('http://localhost:5000/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setUsername(response.data.username);  // Assuming the response contains { username }
        setIsLoggedIn(true);
      })
      .catch(err => {
        setIsLoggedIn(false); // If error occurs (e.g., token expired), log out
        console.error(err);
      });
    }
  }, [token]);

  const handleSignupClick = () => {
    if (!isLoggedIn) {
      // Redirect to register page if not logged in
      navigate('/register');
    } else {
      // Redirect or show "Hello, username" if already logged in
      alert(`Hello, ${username}`);
    }
  };

  return (
    <button onClick={handleSignupClick} className="profile-button">
      {isLoggedIn ? `Hello, ${username}` : 'Sign Up'}
    </button>
  );
};

export default ProfileButton;

