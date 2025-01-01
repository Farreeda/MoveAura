const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const dotenv = require('dotenv');

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

//db.connect((err) => {
//  if (err) {
//    console.error('Error connecting to MySQL:', err);
//    return;
//  }
//  console.log('Connected to MySQL database.');
//});

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

    if (!username || !password || !email) {
        return res.status(400).send('Username, password, and email are required.');
      }
    
  // Check if user already exists
  const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
  db.query(checkUserQuery, [username], async (err, results) => {
    if (err) {
      console.error('Error checking for existing user:', err);
      return res.status(500).send('Error checking for user.');
    }

    if (results.length > 0) {
      return res.status(400).send('User already exists.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user into the database
    const insertUserQuery = 'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)';
    db.query(insertUserQuery, [username, hashedPassword, email, 'user'], (err, results) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).send('Error creating user.');
      }

      res.status(201).send('User registered successfully.');
    });
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
      process.env.JWT_SECRET, // Secret from environment
      { expiresIn: '1h' }
    );

    res.json({ token });
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


app.post('/api/book', async (req, res) => {
  const { user_id, provider_id, session_id } = req.body;

  // Find the service provider and extract schedule
  const provider = await db.query('SELECT * FROM serviceprovider WHERE provider_id = ?', [provider_id]);

  if (!provider || !provider[0].schedule) {
    return res.status(404).json({ error: 'Service provider not found' });
  }

  // Parse schedule JSON
  const schedule = JSON.parse(provider[0].schedule);

  // Find the session in the schedule
  const session = schedule.sessions.find(s => s.session_id === session_id);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Create booking
  const price = session.price;
  const booking_time = new Date();

  const booking = await db.query(
    'INSERT INTO bookings (user_id, provider_id, session_id, price, booking_time) VALUES (?, ?, ?, ?, ?)',
    [user_id, provider_id, session_id, price, booking_time]
  );

  return res.status(201).json({ message: 'Booking successful', booking_id: booking.insertId });
});


// Search API (Example)
app.get('/search', (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  const sql = 'SELECT * FROM sports WHERE name LIKE ?';
  const searchTerm = `%${query}%`;

  db.query(sql, [searchTerm], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ message: 'Error fetching data.' });
    }

    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
