import Story from '../models/Story.js';

// ✅ CREATE new story
export const createStory = async (req, res) => {
  try {
    const storyData = {
      ...req.body,
      verified: true,
      date: new Date(),
      likes: 0,
      comments: 0
    };

    const newStory = new Story(storyData);
    const saved = await newStory.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET only verified stories
export const getStories = async (req, res) => {
  try {
    const stories = await Story.find({ verified: true }).sort({ date: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET all stories (admin panel)
export const getAllStories = async (req, res) => {
  try {
    const stories = await Story.find().sort({ date: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET unverified stories (admin use)
export const getUnverifiedStories = async (req, res) => {
  try {
    const stories = await Story.find({ verified: false });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ VERIFY a story
export const verifyStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true }
    );
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json(story);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ DELETE a story (admin use)
export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json({ message: '✅ Story deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
