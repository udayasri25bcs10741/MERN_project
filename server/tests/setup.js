/**
 * Jest setup — connects to a test database and tears down after all tests.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Use a separate test DB
const TEST_DB = process.env.MONGODB_TEST_URI || process.env.MONGODB_URI?.replace(/\/(\w+)(\?|$)/, '/foodbridge_test$2') || 'mongodb://localhost:27017/foodbridge_test';

beforeAll(async () => {
  await mongoose.connect(TEST_DB);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
