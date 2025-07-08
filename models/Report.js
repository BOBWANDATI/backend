import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., "theft", "fight", etc.
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    required: true,
  },
  urgency: {
    type: String,
    required: true,
  },
  reporter: {
    type: String, // 'anonymous' or 'user'
    default: 'anonymous',
  },
  followUp: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'escalated'],
    default: 'pending',
  },
  media: {
    type: [String], // Uploaded file paths
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 📍 Enable geospatial queries
incidentSchema.index({ location: '2dsphere' });

const Incident = mongoose.models.Incident || mongoose.model('Incident', incidentSchema);

export default Incident;
