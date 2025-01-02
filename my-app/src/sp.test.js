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

describe('POST /api/service-provider/${provider_id}', () => {
    
    
    
    it('should return service provider data along with reviews for a valid provider ID', async () => {
        // Mock the database queries
        db.query.mockImplementationOnce((query, values, callback) => {
            // Simulate service provider data
            callback(null, [
                            {
                                name: 'Kickboxing Cairo',
                                images: ['image1.jpg', 'image2.jpg'],
                                location: '123 Test Street',
                                schedule: 'Mon-Fri 9:00 AM - 5:00 PM',
                                rating: 4.5,
                                description: 'A great service provider.',
                            },
                            ]);
        });
        
        db.query.mockImplementationOnce((query, values, callback) => {
            // Simulate reviews for the service provider
            callback(null, [
                { customer_id: 1, comment: 'Great service!', rating: 5 },
                { customer_id: 2, comment: 'Good experience.', rating: 4 },
            ]);
        });
        
        const provider_id = 18; // Example valid provider ID
        const response = await request(app)
        .get(`/service-provider/${provider_id}`);
        
        console.log('Response:', response.text); // Log the response text for debugging
        
        // Expect a successful response with service provider data and reviews
        expect(response.status).toBe(200); // OK status code
        expect(response.body.results).toBeDefined(); // Service provider data should be returned
        expect(response.body.reviews).toBeDefined(); // Reviews should be returned
        expect(response.body.reviews.length).toBe(4); // Check if there are two reviews
        expect(response.body.results[0].name).toBe('Kickboxing Cairo'); // Check if the provider name matches
    });
    
    it('should return an error for an invalid provider ID', async () => {
        const invalidProviderId = 'invalid'; // Invalid provider ID (non-numeric)
        const response = await request(app)
        .get(`/service-provider/${invalidProviderId}`);
        
        console.log('Response:', response.text); // Log the response text for debugging
        
        // Expect a bad request error for invalid provider ID
        expect(response.status).toBe(400); // Bad Request status code
        expect(response.body.error).toBe('Invalid provider ID');
    });
    
    it('should return an error if the provider does not exist', async () => {
        // Mock the case where the provider does not exist
        db.query.mockImplementationOnce((query, values, callback) => {
            callback(null, []); // Simulate no provider found
        });
        
        const provider_id = 999; // Example provider ID that does not exist
        const response = await request(app)
        .get(`/service-provider/${provider_id}`);
        
        console.log('Response:', response.text); // Log the response text for debugging
        
        // Expect a not found error if the provider does not exist
        expect(response.status).toBe(404); // Not Found status code
        expect(response.text).toBe('Service provider not found.');
    });
    
    
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

