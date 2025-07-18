//import mongoose from 'mongoose';

//const newsSchema = new mongoose.Schema({
  //title: String,
  //content: String,
  //image: String,
  //createdAt: {
   // type: Date,
   // default: Date.now,
 // },
//});

//const News = mongoose.model('News', newsSchema);
//export default News;


// models/News.js
import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    link: { type: String },
    verified: { type: Boolean, default: false }, // ⬅️ NEW FIELD
  },
  { timestamps: true }
);

export default mongoose.model('News', newsSchema);

