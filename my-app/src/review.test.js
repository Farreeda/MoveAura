const request = require('supertest');
//const bcrypt = require('bcrypt');
const app = require('../../backend/server.js');  // Import your Express app
const db = require('./db'); // Your database connection
jest.mock('./db'); // Mock the database module
const http = require('http');
const crypto = require('crypto');

function generateRandomString(length) {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}
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

it('should submit a review for a provider', async () => {
  // Mock the database query response for a successful review insertion
  db.query.mockImplementationOnce((query, values, callback) => {
    callback(null, { insertId: 1 }); // Simulate successful review insertion with insertId: 1
  });

  // Mock request data
  const provider_id = 19; // Example provider ID
  const user_id = 13; // Example user ID
  const rating = 4; // Example rating
  const text = 'Great service!'; // Example review text

  // Make the request
  const response = await request(app)
    .post('/api/review')
    .send({
      provider_id,
      user_id,
      rating,
      text,
    });

  console.log('Response:', response.text);  // Log the response text for debugging

  // Expect a successful review submission
  expect(response.status).toBe(200);  // OK status code
  expect(response.body.success).toBe(true); // Success flag
  expect(response.body.review).toBeDefined(); // Check if review object is returned
  expect(response.body.review.review_id).toBeDefined(); // Check if review ID is returned
  expect(response.body.review.provider_id).toBe(provider_id); // Check if provider ID matches
  expect(response.body.review.user_id).toBe(user_id); // Check if user ID matches
  expect(response.body.review.rating).toBe(rating); // Check if rating matches
  expect(response.body.review.text).toBe(text); // Check if text matches
});

it('should return an error if any required field is missing', async () => {
  // Make the request with missing required fields
  const response = await request(app)
    .post('/api/review')
    .send({
      provider_id: 1,
      user_id: 1,
      rating: 5,  // Missing text field
    });

  console.log('Response:', response.text);  // Log the response text for debugging

  // Expect a bad request error
  expect(response.status).toBe(400);  // Bad Request status code
  expect(response.body.message).toBe('All fields are required.');
});

    

/*it('should return an error if username is already in use', async () => {
  // Mock an existing user with the same email
  db.query.mockResolvedValueOnce([{ email: 'test@example.com' }]);  // Simulate user found with the email

  const response = await request(app)
    .post('/api/register')
    .send({
      email: 'test@example.com',
      password: 'password123',
      username: 'John Doe'
    })
    .expect(400);

});
});*/

