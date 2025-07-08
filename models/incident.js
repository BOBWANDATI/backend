// models/incident.js
import mongoose from 'mongoose';

// Define Incident Schema
const incidentSchema = new mongoose.Schema({
  incidentType: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // Format: [longitude, latitude]
      required: true
    }
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'escalated'],
    default: 'pending'
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  followUp: {
    type: Boolean,
    default: false
  },
  files: {
    type: [String], // Stores file paths or URLs
    default: []
  }
}, {
  timestamps: true
});

// 2dsphere index for geospatial queries
incidentSchema.index({ location: '2dsphere' });

// Avoid model overwrite in dev environments
const Incident = mongoose.models.Incident || mongoose.model('Incident', incidentSchema);

export default Incident;
