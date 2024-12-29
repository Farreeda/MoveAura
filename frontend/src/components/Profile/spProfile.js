import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import ReactStars from 'react-stars';
import './spProfile.css';
import yoga1 from './images/yoga1.jpg';
import yoga2 from './images/yoga2.jpg';
import { useParams } from 'react-router-dom'; // Import useParams hook

const ServiceProvider = () => {
    const { provider_id } = useParams(); // 'id' is the parameter from the route
    console.log('Provider ID:', provider_id);

    const [serviceProvider, setServiceProvider] = useState({
        name: 'Faree',
        images: [],
        location: { x: 0, y: 0 },
        schedule: {},
        rating: 0,
        description: '',
        reviews: [],
    });

    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 0, text: '' });
    const [user, setUser] = useState(null); // To store the logged-in user
    const [bookingStatus, setBookingStatus] = useState('');
    
    // Fetch service provider data
    useEffect(() => {
        fetch(`http://localhost:5009/service-provider/${provider_id}`)
            .then((response) => response.json())
            .then((data) => {
                const { results, reviews } = data; // Destructure the response
                console.log('Received Data:', reviews);

                if (results && results.length > 0) {
                    const provider = results[0];
                    setServiceProvider({
                        ...provider,
                        reviews: reviews || [],
                    });
                    setReviews(reviews || []);
                } else {
                    setServiceProvider({
                        name: 'Not Found',
                        images: [],
                        location: { x: 0, y: 0 },
                        schedule: {},
                        rating: 0,
                        description: 'No service provider found.',
                        reviews: [],
                    });
                }
            })
            .catch((error) => {
                console.error('Error fetching service provider data:', error);
            });
    }, [provider_id]);

    // Handle review submission
    const handleReviewChange = (e) => {
        const { name, value } = e.target;
        setNewReview((prevReview) => ({
            ...prevReview,
            [name]: value,
        }));
    };

    const handleRatingChange = (newRating) => {
        setNewReview((prevReview) => ({
            ...prevReview,
            rating: newRating,
        }));
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        if (!user) {
            alert('You must be logged in to leave a review.');
            return;
        }

        // Make an API call to submit the review
        fetch(`http://localhost:5009/api/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                provider_id: provider_id,
                user_id: user.id, // Assuming user.id is available
                rating: newReview.rating,
                text: newReview.text,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setReviews([...reviews, data.review]);
                    alert('Your review has been submitted.');
                    setNewReview({ rating: 0, text: '' });
                } else {
                    alert('Failed to submit the review.');
                }
            })
            .catch((error) => {
                console.error('Error submitting review:', error);
            });
    };

    
    const handleBooking = (day, time) => {
           if (!user) {
               alert('You must be logged in to book a class.');
               return;
           }

           // Send the booking request to the backend
           fetch('http://localhost:5009/api/book', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                   provider_id: provider_id,
                   user_id: user.id,
                   day,
                   time,
               }),
           })
               .then((response) => response.json())
               .then((data) => {
                   if (data.success) {
                       setBookingStatus('Booking successful!');
                       alert('Your class has been booked.');
                   } else {
                       setBookingStatus('Failed to book the class.');
                       alert('Failed to book the class.');
                   }
               })
               .catch((error) => {
                   console.error('Error booking class:', error);
               });
       };
    
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
                    {serviceProvider.images &&
                        serviceProvider.images.map((image, index) => (
                            <img
                                key={index}
                                src={yoga1}
                                alt={`Service provider image ${index + 1}`}
                                onError={(e) => (e.target.src = yoga1)} // Fallback image
                            />
                        ))}
                </div>
            </div>

            <div className="map-container">
                <h3>Location</h3>
                <LoadScript googleMapsApiKey="AIzaSyCMLZk2EyzqLGW46zjQhMERud09RpJLmP4">
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={{
                            lat: serviceProvider.location.x,
                            lng: serviceProvider.location.y,
                        }}
                        zoom={15}
                    >
                        <Marker
                            position={{
                                lat: serviceProvider.location.x,
                                lng: serviceProvider.location.y,
                            }}
                        />
                    </GoogleMap>
                </LoadScript>
            </div>

            <div className="schedule-container">
                <h3>Schedule</h3>
                <ul>
                    {Object.entries(serviceProvider.schedule).map(([day, time], index) => (
                        <li key={index}>
                            <strong>{day.charAt(0).toUpperCase() + day.slice(1)}:</strong> {time}
                               <button onClick={() => handleBooking(day, time)}>Book Class</button>

                        </li>
                    ))}
                </ul>
            </div>

            <div className="rating-container">
                <h3>Rating</h3>
                <ReactStars
                    count={5}
                    value={serviceProvider.rating}
                    size={24}
                    edit={false}
                    color2={'#ffd700'}
                />
                <p>{serviceProvider.rating} / 5</p>
            </div>

            <div className="reviews-container">
                <h3>Reviews</h3>
                {reviews.length > 0 ? (
                    <ul>
                        {reviews.map((review, index) => (
                            <li key={index} className="review-item">
                                <strong>{review.comment}:</strong> <span>{review.text}</span>
                                <ReactStars
                                    count={5}
                                    value={review.rating}
                                    size={20}
                                    edit={false}
                                    color2={'#ffd700'}
                                />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No reviews yet.</p>
                )}
            </div>

            {/* Add Review Section */}
            { (
                <div className="review-form-container">
                    <h3>Leave a Review</h3>
                    <form onSubmit={handleSubmitReview}>
                        <div className="rating-input">
                            <label htmlFor="rating">Rating:</label>
                            <ReactStars
                                count={5}
                                value={newReview.rating}
                                onChange={handleRatingChange}
                                size={24}
                                color2={'#ffd700'}
                            />
                        </div>
                        <div className="text-input">
                            <label htmlFor="text">Review:</label>
                            <textarea
                                id="text"
                                name="text"
                                value={newReview.text}
                                onChange={handleReviewChange}
                                rows="4"
                                placeholder="Write your review here..."
                            />
                        </div>
                        <button type="submit">Submit Review</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ServiceProvider;
