import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import './images/yoga.avif';
import './images/mma.png';
import './images/tennis.avif';
import './images/parashuting.avif';
import axios from 'axios'; // For making HTTP requests to the backend




const Home = () => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');

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
    }
    const handleSearch = async () => {
            try {
                const response = await fetch(`http://localhost:5000/search?query=${query}`);
                const results = await response.json();
                setSearchResults(results);
            } catch (error) {
                console.error('Error fetching search results:', error);
            }
        };

    const sports = [
        { name: 'Yoga', image: './images/yoga.avif' },
        { name: 'MMA', image: './images/mma.png' },
        { name: 'Tennis', image: './images/tennis.avif' },
        { name: 'Skydiving', image: './images/parashuting.avif' },
    ];

    const handleSportClick = (sportName) => {
        navigate(`/sports/${sportName.toLowerCase()}`);
    };

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>TheMoveAura</h1>
            <button onClick={handleSignupClick} className="profile-button">
              {isLoggedIn ? `Hello, ${username}` : 'Sign Up'}
            </button>
            </header>
            
            <div className="search-container">
                       <input
                           type="text"
                           placeholder="Search for sports, customers, or service providers"
                           value={query}
                           onChange={(e) => setQuery(e.target.value)}
                       />
                       <button onClick={handleSearch}>Search</button>
                   </div>

                   <div className="search-results">
                       {searchResults.map((item, index) => (
                           <div key={index} className="result-item">
                               <h3>{item.name}</h3>
                               {item.type && <p>Type: {item.type}</p>} {/* Add type if available */}
                           </div>
                       ))}
                   </div>
            
            <div className="map-container">
                <iframe
                    title="Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.8354345093705!2d144.9537353153166!3d-37.81720997975159!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf57729d7cb97a43b!2sFederation%20Square!5e0!3m2!1sen!2sau!4v1614111664353!5m2!1sen!2sau"
                    width="600"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                ></iframe>
            </div>

            <div className="sports-gallery">
                {sports.map((sport) => (
                    <div
                        key={sport.name}
                        className="sport-item"
                        onClick={() => handleSportClick(sport.name)}
                    >
                        <img src={sport.image} alt={sport.name} className="sport-image" />
                        <h3>{sport.name}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
