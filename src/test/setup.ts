import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from '../config/env';
import { User } from '../models/User';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Create an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  if (!mongoose.connection.db) {
    throw new Error('Database connection not established');
  }

  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

// Helper function to create a test user
export const createTestUser = async (userData = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    passwordConfirm: 'password123',
    ...userData,
  };

  return await User.create(defaultUser);
};

// Helper function to get auth token
export const getAuthToken = async (user: any) => {
  const token = user.generateAuthToken();
  return `Bearer ${token}`;
};
