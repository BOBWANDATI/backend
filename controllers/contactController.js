// controllers/contactController.js
import { mailTransporter } from '../server.js'; // ✅ Reuse transporter
import Message from '../models/contact.js';

export const sendContactEmail = async (req, res) => {
  const { name, email, phone, category, subject, message, newsletter } = req.body;

  if (!name || !email || !category || !subject || !message) {
    return res.status(400).json({ msg: 'All required fields must be filled.' });
  }

  try {
    // 1. Save to DB
    const newMessage = new Message({
      name,
      email,
      phone,
      category,
      subject,
      message,
      newsletter,
    });

    const savedMessage = await newMessage.save();

    // 2. Emit via socket
    const io = req.app.get('io');
    if (io) {
      io.emit('new_contact_message', {
        id: savedMessage._id,
        name,
        email,
        phone,
        category,
        subject,
        message,
        newsletter,
        createdAt: savedMessage.createdAt,
      });
      console.log('📢 Emitted new_contact_message:', savedMessage._id);
    }

    // 3. Send email using shared transporter
    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_RECEIVER,
      subject: `[${category}] ${subject}`,
      html: `
        <h3>📩 New Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr/>
        <p><strong>Newsletter Subscription:</strong> ${newsletter ? 'Yes' : 'No'}</p>
      `,
    };

    await mailTransporter.sendMail(mailOptions);
    res.status(200).json({ msg: 'Message sent and saved successfully!' });

  } catch (err) {
    console.error('❌ Email or DB Error:', err);
    res.status(500).json({ msg: 'Failed to process and send message.' });
  }
};
