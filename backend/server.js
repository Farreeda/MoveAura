const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const moment = require('moment');

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = 5009;

const corsOptions = {
  origin: 'http://localhost:3000', // Your frontend's URL
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'user', // Replace with your MySQL username
  password: 'newpassword', // Replace with your MySQL password
  database: 'moveaura', // Replace with your database name
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Middleware for authentication
const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(403).send("Access denied.");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use secret from environment
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send("Invalid token.");
  }
};

// User Registration
app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;

  // Check for required fields
  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Username, password, and email are required.' });
  }

  // Check if user already exists
  const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
  
  // Wrap the db query in a promise
  db.promise().query(checkUserQuery, [username])
    .then(([results]) => {
      if (results.length > 0) {
        return res.status(400).json({ message: 'User already exists.' });
      }

      // Hash password
      return bcrypt.hash(password, 10);
    })
    .then((hashedPassword) => {
      // Insert new user into the database
      const insertUserQuery = 'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)';
      return db.promise().query(insertUserQuery, [username, hashedPassword, email, 'user']);
    })
    .then(() => {
      // Respond with success
      res.status(201).json({ message: 'User registered successfully.' });
    })
    .catch((err) => {
      console.error('Error:', err);
      res.status(500).json({ message: 'An error occurred. Please try again.' });
    });
});

// User Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
    length = 0
  // Find the user by username
  const findUserQuery = 'SELECT * FROM users WHERE username = ?';
  db.query(findUserQuery, [username], async (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).send('Error logging in.');
    }

    if (results.length === 0) {
      return res.status(400).send('User not found.');
    }

    const user = results[0];

    // Compare password with stored hash
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(400).send('Invalid password.');

    // Generate JWT token
    const token = jwt.sign(
      { username: user.username },
      "Fareeda33", // Secret from environment
      { expiresIn: '1h' }
    );
      
    res.setHeader('Content-Type', 'application/json');
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.json({
        token,
        username: user.username,  // Send username to the client
        user_id: user.user_id
    });
  });
});


// Service Providers Login
app.post('/api/splogin', async (req, res) => {
  const { name, password } = req.body;

  // Find the user by username
  const findUserQuery = 'SELECT * FROM serviceproviders WHERE name = ?';
  db.query(findUserQuery, [name], async (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).send('Error logging in.');
    }

    if (results.length === 0) {
      return res.status(400).send('User not found.');
    }

    const user = results[0];

    // Compare password with stored hash
      const isValidPassword = await bcrypt.compare(password, serviceprovider.password);
    if (!isValidPassword) return res.status(400).send('Invalid password.');

    // Generate JWT token
    const token = jwt.sign(
      { name: serviceprovider.name },
      process.env.JWT_SECRET, // Secret from environment
      { expiresIn: '1h' }
    );

    res.json({ token });
  });
});


// service-provider Profile Management
app.get('/service-provider/:provider_id', (req, res) => {
    const provider_id = req.params.provider_id;
    if (isNaN(provider_id)) {
        return res.status(400).json({ error: 'Invalid provider ID' });
      }
    console.log('Provider ID:', provider_id);
    const query = `
        SELECT 
          name, images, location, schedule, rating, description 
        FROM 
          serviceprovider
        WHERE 
          provider_id = ?
      `;
    db.query(query, [provider_id], (err, results) => {
        if (err) {
            console.error('Error fetching service provider:', err);
            return res.status(500).send('Error fetching service provider.');
        }
        
        if (results.length === 0) {
            return res.status(404).send('Service provider not found.');
        }
        
        // Fetch reviews for the service provider
        const reviewsQuery = 'SELECT customer_id, comment, rating FROM reviews WHERE provider_id = ?';
        
        db.query(reviewsQuery, [provider_id], (err, reviews) => {
            if (err) {
                console.error('Error fetching reviews:', err);
                return res.status(500).send('Error fetching reviews.');
            }
            
            // Combine service provider data and reviews
            const serviceProvider = {
                results,
                reviews: reviews,
            };
            res.json(serviceProvider); // Send the data back to the frontend
        });
    });
});

module.exports = app;  // Export app for testing


app.get('/api/service-providers', (req, res) => {
    const query = `
        SELECT 
          name, images, location, schedule, rating, description 
        FROM 
          serviceprovider
      `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching service provider:', err);
            return res.status(500).send('Error fetching service provider.');
        }
        const serviceProvider = {
            results
        };
        res.json(serviceProvider);
});
});


app.post('/api/review', (req, res) => {
  const { provider_id, user_id, rating, text } = req.body;

  // Validate input
  if (!provider_id || !user_id || !rating || !text) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // SQL query to insert the review into the database
  const insertReviewQuery = `
    INSERT INTO reviews (provider_id, customer_id, rating, comment)
    VALUES (?, ?, ?, ?)
  `;

  db.query(insertReviewQuery, [provider_id, user_id, rating, text], (err, results) => {
    if (err) {
      console.error('Error inserting review:', err);
      return res.status(500).json({ message: 'Error submitting review.' });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      review: {
        provider_id,
        user_id,
        rating,
        text,
        review_id: results.insertId, // Return the ID of the newly inserted review
      },
    });
  });
});


app.post('/api/book', async (req, res) => {
  const { user_id, provider_id, day, time } = req.body;

  if (!provider_id || !user_id || !day || !time) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const price = 300;
      const currentDate = moment().startOf('week');
      const bookingDate = currentDate.add(moment().day(day).day() - 1, 'days'); // Adjust to match the given day

    const booking_time = `${bookingDate} ${time.split('-')[0].trim()}:00`;

    const [result] = await db.promise().query(
      'INSERT INTO bookings (user_id, provider_id, price, booking_time) VALUES (?, ?, ?, ?)',
      [user_id, provider_id, price, booking_time]
    );

    return res.status(201).json({ message: 'Booking successful', booking_id: result.insertId });
  } catch (err) {
    console.error('Error creating booking:', err);
    return res.status(500).json({ message: 'Failed to create booking.' });
  }
});


// Search API (Example)
app.get('/search', (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  const sql = 'SELECT * FROM sports WHERE sport_name LIKE ?';
  const searchTerm = `%${query}%`;

  db.query(sql, [searchTerm], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ message: 'Error fetching data.' });
    }

    res.json(results);
  });
});




//app.listen(port, () => {
 // console.log(`Server is running on http://localhost:${port}`);
//});
