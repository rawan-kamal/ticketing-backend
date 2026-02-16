const express = require('express');
const router = express.Router();
const Reply = require('../models/Reply');
const Agent = require('../models/Agent');
const { verifyToken } = require('../config/auth');
const { sendAgentReplyEmail } = require('../config/email');

// Get all replies for a ticket (protected)
router.get('/ticket/:ticketId', verifyToken, async (req, res) => {
  try {
    const replies = await Reply.find({ ticketId: req.params.ticketId }).sort({ createdAt: 1 });
    res.json(replies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Agent sends reply (protected)
router.post('/ticket/:ticketId', verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    // Get agent info
    const agent = await Agent.findById(req.agentId);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    // Get ticket info for email
    const Ticket = require('../models/Ticket');
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    const reply = new Reply({
      ticketId: req.params.ticketId,
      message,
      sender: 'Agent',
      senderName: agent.name,
      senderEmail: agent.email
    });
    
    await reply.save();
    
    // Send email notification to customer
    try {
      await sendAgentReplyEmail(
        ticket.customerEmail,
        ticket.ticketNumber,
        ticket.customerName,
        agent.name,
        message
      );
      console.log('✅ Email sent to customer:', ticket.customerEmail);
    } catch (emailError) {
      console.error('⚠️ Email failed but reply saved:', emailError);
      // Don't fail the request if email fails
    }
    
    res.status(201).json(reply);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete reply (protected)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    await reply.deleteOne();
    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUBLIC: Get all replies for a ticket (by ticket number + email)
router.post('/track/:ticketNumber', async (req, res) => {
  try {
    const { customerEmail } = req.body;
    const { ticketNumber } = req.params;

    // Verify ticket belongs to this email
    const Ticket = require('../models/Ticket');
    const ticket = await Ticket.findOne({
      ticketNumber: ticketNumber.toUpperCase(),
      customerEmail: customerEmail.toLowerCase()
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const replies = await Reply.find({ ticketId: ticket._id }).sort({ createdAt: 1 });
    res.json(replies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUBLIC: Customer sends reply (no auth required, verified by email)
router.post('/customer/:ticketNumber', async (req, res) => {
  try {
    const { customerEmail, message } = req.body;
    const { ticketNumber } = req.params;
    
    // Verify ticket belongs to this email
    const Ticket = require('../models/Ticket');
    const ticket = await Ticket.findOne({ 
      ticketNumber: ticketNumber.toUpperCase(),
      customerEmail: customerEmail.toLowerCase()
    });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    const reply = new Reply({
      ticketId: ticket._id,
      message,
      sender: 'Customer',
      senderName: ticket.customerName,
      senderEmail: ticket.customerEmail
    });
    
    await reply.save();
    
    // Update ticket status to Pending if it was Resolved (customer responded)
    if (ticket.status === 'Resolved') {
      ticket.status = 'Pending';
      await ticket.save();
    }
    
    res.status(201).json(reply);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;