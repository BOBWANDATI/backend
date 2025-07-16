import Story from '../models/Story.js';

// ✅ CREATE new story + emit
export const createStory = async (req, res) => {
  try {
    const storyData = {
      ...req.body,
      verified: true,
      date: new Date(),
      likes: 0,
      comments: 0,
    };

    const newStory = new Story(storyData);
    const saved = await newStory.save();

    const io = req.app.get('io');
    io.emit('story_created', saved);

    const allStories = await Story.find().sort({ date: -1 });
    io.emit('all_stories_update', allStories);

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET only verified stories (for users)
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

// ✅ GET unverified stories (for admin)
export const getUnverifiedStories = async (req, res) => {
  try {
    const stories = await Story.find({ verified: false });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ VERIFY a story + emit
export const verifyStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true }
    );
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const io = req.app.get('io');
    io.emit('story_verified', story);

    const allStories = await Story.find().sort({ date: -1 });
    io.emit('all_stories_update', allStories);

    res.json(story);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ DELETE a story + emit
export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const io = req.app.get('io');
    io.emit('story_deleted', { _id: req.params.id });

    const allStories = await Story.find().sort({ date: -1 });
    io.emit('all_stories_update', allStories);

    res.json({ message: '✅ Story deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
