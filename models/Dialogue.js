const mongoose = require('mongoose');

const dialogueSchema = new mongoose.Schema({
  topic: String,
  participants: [String],
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Dialogue', dialogueSchema);
