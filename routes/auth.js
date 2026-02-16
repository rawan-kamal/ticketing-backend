const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const { generateToken } = require('../config/auth');

// Register new agent (you'll use this once to create your account)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if agent already exists
    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({ message: 'Agent already exists' });
    }
    
    // Create new agent
    const agent = new Agent({ name, email, password, role: role || 'Agent' });
    await agent.save();
    
    // Generate token
    const token = generateToken(agent._id);
    
    res.status(201).json({
      message: 'Agent registered successfully',
      token,
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        role: agent.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find agent
    const agent = await Agent.findOne({ email });
    if (!agent) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await agent.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = generateToken(agent._id);
    
    res.json({
      message: 'Login successful',
      token,
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        role: agent.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current agent info (protected route)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    
    const agent = await Agent.findById(decoded.id).select('-password');
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    res.json({ agent });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;