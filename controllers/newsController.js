// controllers/newsController.js
import News from '../models/News.js';


export const getAllNews = async (req, res) => {
    try {
      // Fetch all news from DB
      const news = await News.find().sort({ createdAt: -1 });
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
      const { title, content, image } = req.body;
  
      if (!title || !content) {
        return res.status(400).json({ msg: 'Title and content are required' });
      }
  
      const newNews = new News({
        title,
        content,
        image,
      });
  
      const savedNews = await newNews.save();
      res.status(201).json(savedNews);
    } catch (err) {
      console.error('❌ Error posting news:', err);
      res.status(500).json({ msg: 'Failed to post news' });
    }
  };
  