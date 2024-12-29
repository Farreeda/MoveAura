import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import ReactStars from 'react-stars';
import './spProfile.css';
import './images/yoga1.jpg';
import './images/yoga2.jpg';
import { useParams } from 'react-router-dom'; // Import useParams hook


const ServiceProvider = ({provider_id }) => {
    const [serviceProvider, setServiceProvider] = useState({
        name: '',
        images: [],
        location: [42, 43],
        schedule: {},
        rating: 0,
        description: '',
        reviews:[]
      });
    const [reviews, setReviews] = useState({reviews:[]});

    useEffect(() => {
    fetch(`http://localhost:5009/api/service-provider/${provider_id}`)
      .then((response) => response.json())
      .then((data) => setServiceProvider(data))
      .catch((error) => {
        console.error('Error fetching service provider data:', error);
      });
  }, [provider_id]);

  // Google Map container styling
  const containerStyle = {
    width: '100%',
    height: '400px',
  };

  if (!serviceProvider) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>{serviceProvider.name}</h2>
        <div className="profile-images">

          {serviceProvider.images && serviceProvider.images.map((image, index) => (
           <img key={index} src={`./images/{image}`} alt={`Service provider image ${index + 1}`}
           onError={(e) => e.target.src = './images/yoga1.jpg'} // Set a fallback if the image fails to load
                                                    
            />
          ))}
        </div>
      </div>

      <div className="map-container">
        <h3>Location</h3>
        <LoadScript googleMapsApiKey="AIzaSyCMLZk2EyzqLGW46zjQhMERud09RpJLmP4">
          <GoogleMap
            mapContainerStyle={containerStyle}
          center={{lat: serviceProvider.location[0], lng: serviceProvider.location[1]}}
            zoom={15}
          >
          <Marker position={{lat: serviceProvider.location[0], lng: serviceProvider.location[1]}} />
          </GoogleMap>
        </LoadScript>
      </div>

      <div className="schedule-container">
        <h3>Schedule</h3>
        <ul>
          {Object.entries(serviceProvider.schedule).map(([day, time], index) => (
            <li key={index}>
              <strong>{day.charAt(0).toUpperCase() + day.slice(1)}:</strong> {time}
            </li>
          ))}
        </ul>
      </div>

      <div className="rating-container">
        <h3>Rating</h3>
        <ReactStars count={5} value={serviceProvider.rating} size={24} edit={false} color2={'#ffd700'} />
        <p>{serviceProvider.rating} / 5</p>
      </div>

          <div className="reviews-container">
                 <h3>Reviews</h3>
                 {reviews.length > 0 ? (
                   <ul>
                     {reviews.map((review, index) => (
                       <li key={index} className="review-item">
                         <strong>{serviceProvider.reviews.customer_id}:</strong> <span>{review.text}</span>
                         <ReactStars count={5} value={serviceProvider.reviews.rating} size={20} edit={false} color2={'#ffd700'} />
                       </li>
                     ))}
              </ul>
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>
    </div>
  );
};

export default ServiceProvider;
