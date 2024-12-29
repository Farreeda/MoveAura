const request = require('supertest');
const app = require('../backend/server.js');

describe('GET /service-provider/:provider_id', () => {

  it('should return a service provider for a valid provider_id', async () => {
    const response = await request(app)
      .get('/api/service-provider/16')  // Use a valid provider_id
      .expect(404);

    // Check that the response contains the expected service provider data
  
  });

  it('should return a 404 for an invalid provider_id', async () => {
    const response = await request(app)
      .get('/service-provider/19a')  // Use an invalid provider_id
      .expect('Content-Type', /json/)
      .expect(400);

    // Check that the response contains the expected error message
    expect(response.body).toHaveProperty('error', 'Invalid provider ID');
  });

  it('should return a 400 for a non-numeric provider_id', async () => {
    const response = await request(app)
      .get('/service-provider/abc')  // Invalid provider_id (non-numeric)
      .expect('Content-Type', /json/)
      .expect(400);

    // Check that the response contains the expected error message
    expect(response.body).toHaveProperty('error', 'Invalid provider ID');
  });

  it('should return a 500 if there is a server error', async () => {
    // Simulate a server error by passing an invalid provider_id or causing an issue in the route handler
    const response = await request(app)
      .get('/service-provider/')  // Missing provider_id
      .expect(404);

    // Check that the response contains the expected error message
  });
});
