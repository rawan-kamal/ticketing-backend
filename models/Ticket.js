const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String  // Array of image filenames
  }],
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['New', 'Pending', 'Resolved'],
    default: 'New'
  }
}, {
  timestamps: true
});
// Generate ticket number before saving
ticketSchema.pre('save', async function () {
  if (this.isNew) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);