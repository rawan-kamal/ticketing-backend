const jwt = require('jsonwebtoken');

// JWT Secret (in production, this should be in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT token
const generateToken = (agentId) => {
  return jwt.sign({ id: agentId }, JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.agentId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { generateToken, verifyToken };