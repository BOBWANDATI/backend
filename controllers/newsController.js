// controllers/newsController.js
import News from '../models/News.js';
import { io } from '../server.js'; // ⚠️ Make sure `io` is exported from server.js

export const getAllNews = async (req, res) => {
  try {
    const news = await News.find({ verified: true }).sort({ createdAt: -1 }); // ✅ Only verified news
    res.status(200).json(news);
  } catch (err) {
    console.error('❌ Error fetching news:', err);
    res.status(500).json({ msg: 'Failed to fetch news' });
  }
};

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

export const postNews = async (req, res) => {
  try {
    const { title, content, image, link } = req.body;

    if (!title || !content || !link) {
      return res.status(400).json({ msg: 'Title, content, and link are required' });
    }

    const newNews = new News({
      title,
      content,
      image,
      link,
      verified: false, // ✅ Mark as not verified
    });

    const savedNews = await newNews.save();

    // ✅ Emit to Admin
    if (io) {
      io.emit('news_pending_verification', savedNews);
    }

    res.status(201).json({
      msg: '✅ News submitted and pending admin verification.',
      data: savedNews,
    });
  } catch (err) {
    console.error('❌ Error posting news:', err);
    res.status(500).json({ msg: 'Failed to post news' });
  }
};

// ✅ Admin verification controller
export const verifyNews = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await News.findByIdAndUpdate(
      id,
      { verified: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: 'News not found for verification' });
    }

    res.status(200).json({ msg: 'News verified successfully', data: updated });
  } catch (err) {
    console.error('❌ Error verifying news:', err);
    res.status(500).json({ msg: 'Failed to verify news' });
  }
};
