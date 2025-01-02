import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Signup = () => {
    const [formData, setFormData] = useState({ username: '', password: '', email: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5009/api/register', {  // Corrected API endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Registration successful. Please log in.');
            } else {
                setMessage(data.message || 'Registration failed.');
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
            console.error('Error:', error);
        }
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit} className="signup-form">
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
                <input
                    type="text"
                    name="email"
                    placeholder="ahmed@ezample.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Sign Up</button>
            </form>

            {message && <p className="message">{message}</p>}

            <div>
                Already have an account? <button onClick={() => window.location.href = '/login'}>Log in</button>
            </div>
            <div>
                Are you a service provider? <button onClick={() => window.location.href = '/splogin'}>Log in here</button>
            </div>
        </div>
    );
};

export default Signup;
