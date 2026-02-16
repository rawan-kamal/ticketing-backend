const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { verifyToken } = require('../config/auth');
const upload = require('../config/upload');

// PUBLIC: Customer submits ticket with optional images (no auth required)
router.post('/submit', upload.array('images', 5), async (req, res) => {
  try {
    const { customerName, customerEmail, subject, description, priority } = req.body;

    // Get uploaded file paths
    const imagePaths = req.files ? req.files.map(file => file.filename) : [];

    const ticket = new Ticket({
      customerName,
      customerEmail,
      subject,
      description,
      priority: priority || 'Medium',
      images: imagePaths
    });

    await ticket.save();

    res.status(201).json({
      message: 'Ticket submitted successfully',
      ticketNumber: ticket.ticketNumber,
      ticket
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUBLIC: Track ticket by ticket number and email
router.post('/track', async (req, res) => {
  try {
    const { ticketNumber, customerEmail } = req.body;

    const ticket = await Ticket.findOne({
      ticketNumber: ticketNumber.toUpperCase(),
      customerEmail: customerEmail.toLowerCase()
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found. Please check your ticket number and email.' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PROTECTED: Get all tickets with last reply info (agents only)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, priority, search } = req.query;

    let query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });

    // Get last reply for each ticket
    const Reply = require('../models/Reply');
    const ticketsWithReplies = await Promise.all(
      tickets.map(async (ticket) => {
        const lastReply = await Reply.findOne({ ticketId: ticket._id })
          .sort({ createdAt: -1 })
          .limit(1);

        return {
          ...ticket.toObject(),
          lastReplyBy: lastReply ? lastReply.sender : null,
          lastReplyAt: lastReply ? lastReply.createdAt : null
        };
      })
    );

    res.json(ticketsWithReplies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PROTECTED: Get single ticket (agents only)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PROTECTED: Update ticket status (agents only)
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = status;
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PROTECTED: Update ticket priority (agents only)
router.put('/:id/priority', verifyToken, async (req, res) => {
  try {
    const { priority } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.priority = priority;
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PROTECTED: Delete ticket (agents only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await ticket.deleteOne();
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PROTECTED: Get ticket statistics (agents only)
router.get('/stats/overview', verifyToken, async (req, res) => {
  try {
    const total = await Ticket.countDocuments();
    const newTickets = await Ticket.countDocuments({ status: 'New' });
    const pending = await Ticket.countDocuments({ status: 'Pending' });
    const resolved = await Ticket.countDocuments({ status: 'Resolved' });

    res.json({
      total,
      new: newTickets,
      pending,
      resolved
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
