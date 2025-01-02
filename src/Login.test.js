const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../backend/server.js');  // Import your Express app
const db = require('./db'); // Your database connection
jest.mock('./db'); // Mock the database module
const http = require('http');

let server; // Declare server outside of the test suite

beforeAll((done) => {
  // Set a different port for testing
  process.env.PORT = 0;  // Dynamically assigned port (you can set a specific one if needed)

  // Create server and start listening
  server = http.createServer(app);
  server.listen(process.env.PORT, () => {
    const port = server.address().port; // Dynamically assigned port
    console.log(`Server running on port ${port}`);
    done();  // Call done to signal that the server has started
  });
});

afterAll((done) => {
  if (server) {
    server.close(done);  // Close the server after tests are finished to free the port
  }
});

describe('POST /api/login', () => {
  it('should return an error for invalid credentials', async () => {
    // Mock a user not found
    db.query.mockResolvedValueOnce([]);  // Simulate no user found with the email

    const response = await request(app)
      .post('/api/login')
      .send({
        username: 'wrong@example.com',
        password: 'password123',
      })
      .expect(400);
  });

  it('should log in a user with valid credentials', async () => {
    // Mock a user found in the database
    const hashedPassword = await bcrypt.hash('popo', 10);
    db.query.mockResolvedValueOnce([{ email: 'test@example.com', password: hashedPassword, username: 'popo' }]);  // Simulate user found
    
    const response = await request(app)
      .post('/api/login')
      .send({
        username: 'popo',
        password: 'popo',
      })
      .expect(200);
  });
});
