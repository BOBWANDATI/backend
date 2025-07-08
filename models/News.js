import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const News = mongoose.model('News', newsSchema);
export default News;
