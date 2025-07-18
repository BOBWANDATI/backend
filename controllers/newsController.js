// controllers/newsController.js
import News from '../models/News.js';
import { io } from '../server.js'; // ✅ Socket connection for real-time updates

// ✅ Get only VERIFIED news (for public frontend)
export const getAllNews = async (req, res) => {
  try {
    const news = await News.find({ verified: true }).sort({ createdAt: -1 });
    res.status(200).json(news);
  } catch (err) {
    console.error('❌ Error fetching verified news:', err);
    res.status(500).json({ msg: 'Failed to fetch verified news' });
  }
};

// ✅ Get ALL news (for Admin dashboard - verified + unverified)
export const getAllAdminNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.status(200).json(news);
  } catch (err) {
    console.error('❌ Error fetching all admin news:', err);
    res.status(500).json({ msg: 'Failed to fetch admin news' });
  }
};

// ✅ Get Single News (e.g., for preview)
export const getSingleNews = async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id);
    if (!newsItem) return res.status(404).json({ msg: 'News not found' });
    res.status(200).json(newsItem);
  } catch (err) {
    console.error('❌ Error fetching single news:', err);
    res.status(500).json({ msg: 'Failed to fetch news item' });
  }
};

// ✅ Submit News (from frontend form)
export const postNews = async (req, res) => {
  try {
    const { title, content, image, link } = req.body;

    if (!title || !content || !link) {
      return res.status(400).json({ msg: '⚠️ Title, content, and link are required' });
    }

    const newNews = new News({
      title,
      content,
      image: image || 'https://via.placeholder.com/400x200',
      link,
      verified: false, // Initially NOT verified
    });

    const savedNews = await newNews.save();

    // Emit event for real-time dashboard updates
    if (io) {
      io.emit('news_pending_verification', savedNews);
    }

    res.status(201).json({
      msg: '✅ News submitted and pending admin verification.',
      data: savedNews,
    });
  } catch (err) {
    console.error('❌ Error posting news:', err);
    res.status(500).json({ msg: '❌ Failed to post news' });
  }
};

// ✅ Approve/Verify News (admin action)
export const verifyNews = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await News.findByIdAndUpdate(id, { verified: true }, { new: true });

    if (!updated) {
      return res.status(404).json({ msg: '❌ News not found for verification' });
    }

    res.status(200).json({ msg: '✅ News verified successfully', data: updated });
  } catch (err) {
    console.error('❌ Error verifying news:', err);
    res.status(500).json({ msg: '❌ Failed to verify news' });
  }
};

// ✅ Delete News (admin action)
export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await News.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ msg: '❌ News not found' });
    res.json({ msg: '🗑️ News deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting news:', err);
    res.status(500).json({ msg: '❌ Failed to delete news' });
  }
};
