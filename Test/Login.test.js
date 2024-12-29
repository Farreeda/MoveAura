const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('./server');  // Import your Express app
const db = require('./db'); // Your database connection

jest.mock('./db'); // Mock the database module



describe('POST /api/auth/login', () => {

  it('should log in a user with valid credentials', async () => {
    // Mock a user found in the database
    const hashedPassword = await bcrypt.hash('password123', 10);
    db.query.mockResolvedValueOnce([{ email: 'test@example.com', password: hashedPassword, name: 'John Doe' }]);  // Simulate user found

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body).toHaveProperty('user');
  });

  it('should return an error for invalid credentials', async () => {
    // Mock a user not found
    db.query.mockResolvedValueOnce([]);  // Simulate no user found with the email

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'password123',
      })
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Invalid credentials');
  });

  it('should return an error for incorrect password', async () => {
    // Mock a user with incorrect password
    const hashedPassword = await bcrypt.hash('password123', 10);
    db.query.mockResolvedValueOnce([{ email: 'test@example.com', password: hashedPassword, name: 'John Doe' }]);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      })
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Invalid credentials');
  });
});
