import Discussion from '../models/Discussion.js';

// ✅ Create a new discussion
export const createDiscussion = async (req, res) => {
  const { title, location, category, message, sender } = req.body;

  if (!title || !location || !category || !message || !sender) {
    return res.status(400).json({ msg: 'All fields are required.' });
  }

  try {
    const newDiscussion = new Discussion({
      title,
      location,
      category,
      participants: 1,
      messages: [{
        text: message,
        sender,
        time: new Date().toISOString()
      }]
    });

    const savedDiscussion = await newDiscussion.save();

    const io = req.app.get('io');
    io.emit('new_discussion_created', {
      _id: savedDiscussion._id,
      title: savedDiscussion.title,
      location: savedDiscussion.location,
      category: savedDiscussion.category,
      participants: savedDiscussion.participants,
      createdAt: savedDiscussion.createdAt
    });

    console.log('✅ Discussion created:', savedDiscussion.title);
    res.status(201).json({
      _id: savedDiscussion._id,
      title: savedDiscussion.title,
      location: savedDiscussion.location,
      category: savedDiscussion.category,
      participants: savedDiscussion.participants,
      createdAt: savedDiscussion.createdAt
    });
  } catch (error) {
    console.error('❌ Create Discussion Error:', error.message);
    res.status(500).json({ msg: 'Failed to create discussion.' });
  }
};

// ✅ Add message to existing discussion
export const addMessage = async (req, res) => {
  const { text, sender } = req.body;

  if (!text || !sender) {
    return res.status(400).json({ msg: 'Text and sender are required.' });
  }

  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ msg: 'Discussion not found' });

    const newMessage = {
      text,
      sender,
      time: new Date().toISOString()
    };

    discussion.messages.push(newMessage);
    discussion.participants += 1;

    const updatedDiscussion = await discussion.save();

    const io = req.app.get('io');
    io.emit('new_discussion_message', {
      discussionId: updatedDiscussion._id,
      message: newMessage
    });

    res.status(200).json({
      _id: updatedDiscussion._id,
      participants: updatedDiscussion.participants,
      messages: updatedDiscussion.messages
    });
  } catch (error) {
    console.error('❌ Add Message Error:', error.message);
    res.status(500).json({ msg: 'Failed to add message.' });
  }
};

// ✅ Get all discussions
export const getAllDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find().sort({ createdAt: -1 });

    const response = discussions.map(d => ({
      _id: d._id,
      title: d.title,
      location: d.location,
      category: d.category,
      participants: d.participants,
      createdAt: d.createdAt
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Get All Discussions Error:', error.message);
    res.status(500).json({ msg: 'Failed to fetch discussions.' });
  }
};

// ✅ Get a single discussion by ID
export const getDiscussionById = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ msg: 'Discussion not found' });

    res.status(200).json(discussion);
  } catch (error) {
    console.error('❌ Get Discussion Error:', error.message);
    res.status(500).json({ msg: 'Failed to fetch discussion.' });
  }
};

// ✅ Delete a discussion by ID
export const deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ msg: 'Discussion not found' });
    }

    await discussion.deleteOne(); // or use findByIdAndDelete

    const io = req.app.get('io');
    io.emit('discussion_deleted', { _id: req.params.id });

    console.log('🗑️ Discussion deleted:', discussion.title);
    res.status(200).json({ msg: '✅ Discussion deleted successfully' });
  } catch (error) {
    console.error('❌ Delete Discussion Error:', error.message);
    res.status(500).json({ msg: '❌ Failed to delete discussion' });
  }
};
