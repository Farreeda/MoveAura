// db.js

const connect = () => {
  console.log('Mock database connected');
  return Promise.resolve();  // Simulate successful connection
};

// Mocking a database query function
const query = (sql, params) => {
  console.log(`Mock query executed: ${sql}`, params);

  // Simulating the logic based on the query
  if (sql.includes('SELECT email FROM users WHERE email = ?')) {
    // This simulates a query to check if the email already exists
    if (params[0] === 'test@example.com') {
      return Promise.resolve([{ email: 'test@example.com' }]);  // Simulate user found with this email
    } else {
      return Promise.resolve([]);  // Simulate no user found with this email
    }
  }

  if (sql.includes('INSERT INTO users')) {
    // This simulates a successful insert
    return Promise.resolve([{ insertId: 1 }]);  // Simulate a successful insert with insertId = 1
  }

  // Default fallback, just to avoid breaking if an unhandled query happens
  return Promise.resolve([]);
};

module.exports = {
  connect,
  query,
};
