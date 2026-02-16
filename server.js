const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

// Import routes FIRST (before using them!)
const ticketRoutes = require('./routes/tickets');
const authRoutes = require('./routes/auth');
const replyRoutes = require('./routes/replies');

// Use routes (after importing!)
app.use('/api/tickets', ticketRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/replies', replyRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'SupportHub API - Customer Support Ticketing System' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});