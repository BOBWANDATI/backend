// controllers/contactController.js
import nodemailer from 'nodemailer';
import Message from '../models/contact.js';

export const sendContactEmail = async (req, res) => {
  const { name, email, phone, category, subject, message, newsletter } = req.body;

  // 🚨 Validate required fields
  if (!name || !email || !category || !subject || !message) {
    return res.status(400).json({ msg: 'All required fields must be filled.' });
  }

  try {
    // 💾 1. Save message to DB
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

    // 📢 2. Emit new message to connected admins
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

    // 📧 3. Send confirmation email to admin inbox
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

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

    await transporter.sendMail(mailOptions);

    // ✅ 4. Respond to client
    res.status(200).json({ msg: 'Message sent and saved successfully!' });

  } catch (err) {
    console.error('❌ Error sending contact message:', err);
    res.status(500).json({ msg: 'Failed to process the message.' });
  }
};
