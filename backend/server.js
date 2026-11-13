const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const seedAllData = require('./seed/seedData');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Public Bicycle Sharing and Rental Management API',
    author: 'SUJAL REDDY (2303A51713)',
    version: '1.0.0'
  });
});

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Public Bicycle Sharing and Rental Management API',
    author: 'SUJAL REDDY',
    hallTicket: '2303A51713',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      bicycles: '/api/bikes',
      stations: '/api/stations',
      memberships: '/api/memberships',
      reservations: '/api/reservations',
      rentals: '/api/rentals',
      maintenance: '/api/maintenance',
      reports: '/api/reports'
    }
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/bikes', require('./routes/bikeRoutes'));
app.use('/api/stations', require('./routes/stationRoutes'));
app.use('/api/memberships', require('./routes/membershipRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/rentals', require('./routes/rentalRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server after connecting to Database
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is completely empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No user records found. Auto-seeding initial demonstration data...');
      await seedAllData();
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('================================================================');
      console.log(` PUBLIC BICYCLE SHARING SYSTEM API SERVER RUNNING`);
      console.log(` Port: ${PORT} | Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Developer: SUJAL REDDY (2303A51713) | Academic Year: 2026-2027`);
      console.log(` Health Check: http://localhost:${PORT}/api/health`);
      console.log('================================================================');
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
