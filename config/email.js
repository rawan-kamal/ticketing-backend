const nodemailer = require('nodemailer');

// Get frontend URL from environment variable
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Create transporter with Gmail - FIXED for IPv4
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // Use TLS port instead of 465
    secure: false, // Use TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    },
    family: 4 // Force IPv4 to avoid IPv6 timeout
});

// Test connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email server is ready');
    }
});

// Enhanced email template function
const createEmailTemplate = (ticketNumber, customerName, customerEmail, agentName, message) => {
    // Create tracking URL with pre-filled data
    const trackingUrl = `${FRONTEND_URL}/track?ticket=${ticketNumber}&email=${encodeURIComponent(customerEmail)}`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%);
          padding: 20px;
          margin: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 16px rgba(168, 216, 234, 0.2);
        }
        .header {
          background: linear-gradient(135deg, #a8d8ea 0%, #ffb6d9 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        .emoji {
          font-size: 60px;
          margin-bottom: 15px;
          display: block;
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
          color: white;
        }
        .content {
          padding: 40px 30px;
        }
        .message-box {
          background: linear-gradient(135deg, #f8fbff 0%, #fff5f8 100%);
          padding: 25px;
          border-radius: 16px;
          border-left: 5px solid #a8d8ea;
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #a8d8ea 0%, #ffb6d9 100%);
          color: #000000 !important;
          padding: 16px 40px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 700;
          font-size: 16px;
        }
        .footer {
          text-align: center;
          padding: 30px;
          color: #9ca3af;
          font-size: 14px;
          background: #fafafa;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="emoji">💬</span>
          <h1>New Reply to Your Ticket</h1>
        </div>
        <div class="content">
          <p>Hi ${customerName} 👋</p>
          <p>Ticket: <strong>${ticketNumber}</strong></p>
          <div class="message-box">
            <p><strong>👩🏻‍💻 ${agentName}</strong></p>
            <p>${message}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${trackingUrl}" class="button">Track Your Ticket</a>
          </div>
        </div>
        <div class="footer">
          <p>Customer Support Portal 🎫</p>
        </div>
      </div>
    </body>
    </html>
    `;
};

// Send email function
const sendAgentReplyEmail = async (customerEmail, ticketNumber, customerName, agentName, message) => {
    try {
        const mailOptions = {
            from: `"Customer Support 🎫" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `✨ ${ticketNumber} - New Reply from Support Team`,
            html: createEmailTemplate(ticketNumber, customerName, customerEmail, agentName, message)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent to customer:', customerEmail);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendAgentReplyEmail };