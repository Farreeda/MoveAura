const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5004;

app.use(cors());
app.use(bodyParser.json());

// In-memory database (for demo purposes)
let users = [];
let services = [
  { id: 1, name: "Yoga Class", description: "A relaxing yoga session", ratings: [] },
  { id: 2, name: "Cooking Workshop", description: "Learn to cook Italian dishes", ratings: [] }
];
let events = [
  { id: 1, name: "Dance Event", description: "Join us for a night of dancing" }
];

// Middleware for authentication
const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(403).send("Access denied.");
  
  try {
    const decoded = jwt.verify(token, 'secretkey'); // Use a more secure key in production
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send("Invalid token.");
  }
};

// User Registration
app.post('/api/register', async (req, res) => {
  const { username, password, role } = req.body;
  
  if (users.some(user => user.username === username)) {
    return res.status(400).send("User already exists.");
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { username, password: hashedPassword, role: role || 'user', profile: {} };
  
  users.push(newUser);
  res.status(201).send("User registered successfully.");
});

// User Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username);
  
  if (!user) return res.status(400).send("User not found.");
  
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) return res.status(400).send("Invalid password.");
  
  const token = jwt.sign({ username: user.username, role: user.role }, 'secretkey', { expiresIn: '1h' });
  res.json({ token });
});

// Profile Management
app.put('/api/profile', authenticate, (req, res) => {
  const { profile } = req.body;
  const user = users.find(user => user.username === req.user.username);
  
  if (!user) return res.status(404).send("User not found.");
  
  user.profile = profile;
  res.send("Profile updated successfully.");
});

// Service Discovery
app.get('/api/services', (req, res) => {
  res.json(services);
});

// Book Service (Service discovery and booking)
app.post('/api/book-service', authenticate, (req, res) => {
  const { serviceId } = req.body;
  const service = services.find(s => s.id === serviceId);
  
  if (!service) return res.status(404).send("Service not found.");
  
  res.send(`Successfully booked ${service.name}.`);
});

// Rating System
app.post('/api/rate-service', authenticate, (req, res) => {
  const { serviceId, rating } = req.body;
  const service = services.find(s => s.id === serviceId);
  
  if (!service) return res.status(404).send("Service not found.");
  
  service.ratings.push(rating);
  res.send(`Successfully rated ${service.name} with ${rating} stars.`);
});

// Admin Dashboard
app.get('/api/admin/dashboard', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send("Access denied.");
  
  res.json({ users, services, events });
});

// User Roles and Access Control
app.get('/api/user-role', authenticate, (req, res) => {
  const user = users.find(u => u.username === req.user.username);
  res.json({ role: user.role });
});

// Help and Support Section
app.get('/api/help', (req, res) => {
  const faq = [
    { question: "How do I reset my password?", answer: "You can reset it from the login page." },
    { question: "How can I book a service?", answer: "Search for a service and click 'Book'." }
  ];
  
  res.json(faq);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
