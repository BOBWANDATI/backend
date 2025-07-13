import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  incidentType: {
    type: String,
    required: true, // e.g., "theft", "fight", etc.
  },
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
  locationName: {
    type: String,
    required: false, // optional readable name like "Garissa Market"
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
  reportedBy: {
    type: String, // e.g., 'anonymous' or real username
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
  files: {
    type: [String], // Uploaded file paths like /uploads/image.jpg
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
