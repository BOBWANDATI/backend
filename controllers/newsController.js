import News from '../models/News.js';

// ✅ Public: Get all news
export const getAllNewsPublic = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    console.error('❌ Error fetching news:', err);
    res.status(500).json({ msg: 'Server error fetching news.' });
  }
};

// ✅ Public: Submit news (pending by default)
export const submitNews = async (req, res) => {
  try {
    const { title, content, image, link } = req.body;

    if (!title || !content || !link) {
      return res.status(400).json({ msg: 'Title, content, and link are required.' });
    }

    const newNews = new News({
      title,
      content,
      image: image || 'https://via.placeholder.com/400x200',
      link,
      status: 'pending',
    });

    await newNews.save();
    res.status(201).json({ msg: 'News submitted successfully.', news: newNews });
  } catch (err) {
    console.error('❌ Error submitting news:', err);
    res.status(500).json({ msg: 'Server error submitting news.' });
  }
};
