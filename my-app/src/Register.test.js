const request = require('supertest');
//const bcrypt = require('bcrypt');
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

describe('POST /api/register', () => {

    
    
    it('should register a new user', async () => {
    // Mock a successful registration (user does not exist)
    db.query.mockResolvedValueOnce([]);  // Simulate no user found with the email
    db.query.mockResolvedValueOnce([{ insertId: 1 }]);  // Simulate successful insert

    const response = await request(app)
      .post('/api/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
          username: 'John Doe'
      })
        console.log('Response:', response.text);  // Log the response text for debugging

           // Expect JSON response
           expect(response.status).toBe(200);  // Created status code


   // expect(response.body).toEqual({ message: 'User already exists.' });
  });

    
    
    
  it('should return an error if email is already in use', async () => {
    // Mock an existing user with the same email
    db.query.mockResolvedValueOnce([{ email: 'test@example.com' }]);  // Simulate user found with the email

    const response = await request(app)
      .post('/api/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        username: 'John Doe'
      })
      .expect(500);

  });
});
