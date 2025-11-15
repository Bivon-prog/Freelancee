import { Pool } from 'pg';
import mongoose from 'mongoose';
import { createClient } from 'redis';

// PostgreSQL
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const connectPostgres = async () => {
  try {
    await pool.connect();
    console.log('✅ PostgreSQL connected');
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    throw error;
  }
};

// MongoDB
export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

// Redis
export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connected');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    throw error;
  }
};
