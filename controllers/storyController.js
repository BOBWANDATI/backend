import Story from '../models/Story.js';

// 🔁 Public - Get only verified stories
export const getVerifiedStories = async (req, res) => {
  try {
    const stories = await Story.find({ status: 'verified' }).sort({ createdAt: -1 });
    res.status(200).json({ data: stories });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching stories' });
  }
};

// 📝 Public - Submit a new story
export const submitStory = async (req, res) => {
  try {
    const story = new Story({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      author: req.body.author,
      location: req.body.location,
      imageUrl: req.body.imageUrl,
      videoUrl: req.body.videoUrl,
      status: 'pending', // Mark as pending until approved by admin
    });

    await story.save();
    res.status(201).json({ message: 'Story submitted successfully', story });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit story', error: err.message });
  }
};

// 🔐 Admin - Get all stories
export const getAllStoriesAdmin = async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.status(200).json({ data: stories }); // ✅ Consistent response
  } catch (err) {
    res.status(500).json({ message: 'Server error getting stories' });
  }
};

// 🔐 Admin - Update story status (verify/reject)
export const updateStoryStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['verified', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const updated = await Story.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Story not found' });
    res.status(200).json({ message: 'Story status updated', story: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating story status' });
  }
};

// 🔐 Admin - Delete story
export const deleteStory = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Story.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Story not found' });
    res.status(200).json({ message: 'Story deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting story' });
  }
};
