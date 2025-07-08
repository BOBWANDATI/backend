const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
