// models/News.js
//import mongoose from 'mongoose';

//const newsSchema = new mongoose.Schema(
 // {
   // title: { type: String, required: true },
   // content: { type: String, required: true },
   // image: { type: String },
   // link: { type: String },
    //status: {
    //  type: String,
     // enum: ['pending', 'verified', 'rejected'],
     // default: 'pending',
    //},
  //},
  //{ timestamps: true }
//);

//const News = mongoose.model('News', newsSchema);

//export default News;

import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/400x200', // fallback if none provided
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    submittedBy: {
      type: String, // optional: track user email or username
      default: 'anonymous',
    }
  },
  { timestamps: true }
);

const News = mongoose.model('News', newsSchema);

export default News;

