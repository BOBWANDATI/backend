const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: String,
  content: String,
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Story', storySchema);
