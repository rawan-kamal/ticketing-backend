const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ['Agent', 'Customer'],
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderEmail: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reply', replySchema);