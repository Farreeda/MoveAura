const request = require('supertest');
//const bcrypt = require('bcrypt');
const app = require('../backend/server.js');  // Import your Express app
const db = require('./db'); // Your database connection

jest.mock('./db'); // Mock the database module


describe('POST /api/login', () => {

  it('should log in a user with valid credentials', async () => {
    // Mock a user found in the database
    //const hashedPassword = await bcrypt.hash('password123', 10);
    db.query.mockResolvedValueOnce([{ email: 'test@example.com', password: hashedPassword, name: 'John Doe' }]);  // Simulate user found

    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(400);

  });

  it('should return an error for invalid credentials', async () => {
    // Mock a user not found
    db.query.mockResolvedValueOnce([]);  // Simulate no user found with the email

    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'wrong@example.com',
        password: 'password123',
      })
      .expect(400);

  });


});
