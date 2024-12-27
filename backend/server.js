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


// Profile Management
app.put('/api/profile', authenticate, (req, res) => {
  const { profile } = req.body;
  const username = req.user.username;

  // Update profile in the database
  const updateProfileQuery = 'UPDATE users SET profile = ? WHERE username = ?';
  db.query(updateProfileQuery, [JSON.stringify(profile), username], (err, results) => {
    if (err) {
      console.error('Error updating profile:', err);
      return res.status(500).send('Error updating profile.');
    }

    res.send('Profile updated successfully.');
  });
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
