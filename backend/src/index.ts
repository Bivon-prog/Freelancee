import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectPostgres, connectMongoDB, connectRedis } from './config/database';
import authRoutes from './routes/auth';
import invoiceRoutes from './routes/invoices';
import clientRoutes from './routes/clients';
import timeTrackingRoutes from './routes/timeTracking';
import contractRoutes from './routes/contracts';
import resumeRoutes from './routes/resumes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/time-tracking', timeTrackingRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/resumes', resumeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Orbix Backend' });
});

// Start server
const startServer = async () => {
  try {
    await connectPostgres();
    await connectMongoDB();
    await connectRedis();
    
    app.listen(PORT, () => {
      console.log(`🚀 Orbix Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
