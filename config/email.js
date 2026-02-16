const nodemailer = require('nodemailer');

// Get frontend URL from environment variable
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Create transporter with Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
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
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
        }
        .emoji {
        font-size: 60px;
        margin-bottom: 15px;
        display: block;
        text-align: center;
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
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
        }
        .header p {
          margin: 10px 0 0 0;
          color: rgba(255, 255, 255, 0.95);
          font-size: 16px;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #2d3748;
          margin-bottom: 20px;
        }
        .ticket-badge {
          display: inline-block;
          background: linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%);
          padding: 12px 24px;
          border-radius: 30px;
          margin: 20px 0;
          border: 2px solid #a8d8ea;
        }
        .ticket-number {
          font-size: 22px;
          font-weight: 800;
          background: linear-gradient(135deg, #a8d8ea 0%, #ffb6d9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .section-title {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #6b7280;
          font-weight: 700;
          margin: 30px 0 15px 0;
        }
        .message-box {
          background: linear-gradient(135deg, #f8fbff 0%, #fff5f8 100%);
          padding: 25px;
          border-radius: 16px;
          border-left: 5px solid #a8d8ea;
          margin: 20px 0;
          box-shadow: 0 2px 8px rgba(168, 216, 234, 0.1);
        }
        .agent-header {
          margin-bottom: 15px;
        }
        .agent-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a8d8ea 0%, #ffb6d9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .agent-info {
          flex: 1;
        }
        .agent-name {
          font-weight: 700;
          color: #2d3748;
          font-size: 16px;
        }
        .agent-role {
          font-size: 13px;
          color: #6b7280;
        }
        .message {
          color: #2d3748;
          line-height: 1.8;
          white-space: pre-wrap;
          font-size: 15px;
        }
        .cta-section {
          text-align: center;
          margin: 35px 0;
          padding: 30px;
          background: linear-gradient(135deg, #f0f9ff 0%, #fef3f8 100%);
          border-radius: 16px;
        }
        .cta-text {
          font-size: 16px;
          color: #2d3748;
          margin-bottom: 20px;
          font-weight: 600;
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
        box-shadow: 0 4px 12px rgba(255, 182, 217, 0.3);
        transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 182, 217, 0.4);
        }
        .info-box {
          background: #fffbf5;
          border: 2px solid #ffe4b3;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
        }
        .info-box-title {
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .info-box-text {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        }
        .footer {
          text-align: center;
          padding: 30px;
          color: #9ca3af;
          font-size: 14px;
          border-top: 2px solid #f0f0f0;
          background: #fafafa;
        }
        .footer-logo {
          font-size: 24px;
          margin-bottom: 10px;
        }
        .footer p {
          margin: 5px 0;
        }
        .footer-links {
          margin-top: 15px;
        }
        .footer-link {
          color: #a8d8ea;
          text-decoration: none;
          margin: 0 10px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="emoji">💬</span>
          <h1>New Reply to Your Ticket</h1>
          <p>Our support team is here to help!</p>
        </div>
        
        <div class="content">
          <div class="greeting">Hi ${customerName} 👋</div>
          
          <div class="ticket-badge">
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">TICKET</div>
            <div class="ticket-number">${ticketNumber}</div>
          </div>
          
          <p style="color: #2d3748; font-size: 15px; line-height: 1.6;">
            Great news! Our support team has replied to your ticket. Here's what they said:
          </p>
          
          <div class="section-title">📨 Support Team Reply</div>
          
          <div class="message-box">
            <div class="agent-header">
              <div class="agent-name">👩🏻‍💻 ${agentName} - Support Agent</div>
            </div>
            <div class="message">${message}</div>
          </div>
          
          <div class="cta-section">
            <div class="cta-text">💬 Want to reply or check your ticket status?</div>
            <a href="${trackingUrl}" class="button">Track Your Ticket</a>
          </div>
          
          <div class="info-box">
            <div class="info-box-title">
              <span>💡</span>
              <span>Quick Tip</span>
            </div>
            <div class="info-box-text">
              Click the button above to automatically open your ticket with all details pre-filled. 
              You can reply directly from there!
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-logo">🎫</div>
          <p><strong>Customer Support Portal</strong></p>
          <p>This is an automated message. Please do not reply to this email directly.</p>
          <div class="footer-links">
            <a href="${FRONTEND_URL}/" class="footer-link">Submit New Ticket</a>
            <a href="${trackingUrl}" class="footer-link">Track Ticket</a>
          </div>
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
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendAgentReplyEmail };