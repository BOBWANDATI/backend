import Incident from '../models/incident.js';

// 🚨 Create New Report + Emit
export const createReport = async (req, res) => {
  try {
    const {
      incidentType,
      location,
      date,
      description,
      urgency,
      anonymous,
      followUp
    } = req.body;

    // Validate coordinates (expecting: "lat,lng")
    if (!location || !location.includes(',')) {
      return res.status(400).json({ msg: '❌ Invalid or missing coordinates (format: "lat,lng")' });
    }

    const [latStr, lngStr] = location.split(',');
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ msg: '❌ Coordinates must be valid numbers.' });
    }

    const newReport = new Incident({
      incidentType,
      location: {
        type: 'Point',
        coordinates: [lng, lat] // Mongo expects [longitude, latitude]
      },
      date: date || new Date(),
      description,
      urgency,
      status: 'pending',
      anonymous: anonymous === 'true' || anonymous === true,
      followUp: followUp === 'true' || followUp === true,
      files: req.files?.map(file => `/uploads/${file.filename}`) || []
    });

    const savedReport = await newReport.save();

    // Real-time update via socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('new_incident_reported', {
        id: savedReport._id,
        type: savedReport.incidentType,
        status: savedReport.status,
        date: savedReport.date,
        location: {
          lat,
          lng
        }
      });
      console.log('📢 new_incident_reported emitted:', savedReport._id);
    }

    res.status(201).json({
      msg: '✅ Report submitted successfully',
      data: savedReport
    });

  } catch (err) {
    console.error('❌ Error saving report:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// 📜 Get All Reports (Admin)
export const getAllReports = async (req, res) => {
  try {
    const reports = await Incident.find().sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (err) {
    console.error('❌ Error fetching reports:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// 🗺️ Get Map Data + Stats
export const getMapData = async (req, res) => {
  try {
    const incidents = await Incident.find();

    const formattedIncidents = incidents.map(i => ({
      id: i._id,
      type: i.incidentType,
      status: i.status,
      date: i.date,
      location: {
        lat: i.location.coordinates[1], // [lng, lat]
        lng: i.location.coordinates[0]
      }
    }));

    const stats = {
      pending: await Incident.countDocuments({ status: 'pending' }),
      resolved: await Incident.countDocuments({ status: 'resolved' }),
      total: incidents.length
    };

    res.status(200).json({
      incidents: formattedIncidents,
      stats
    });
  } catch (err) {
    console.error('❌ Error loading map data:', err);
    res.status(500).json({ msg: 'Map loading failed', error: err.message });
  }
};

// ❌ Delete Incident
export const deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Incident.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ msg: '❌ Incident not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('incident_deleted', { id });
      console.log('🗑️ incident_deleted emitted:', id);
    }

    res.status(200).json({ msg: '✅ Incident deleted successfully' });
  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).json({ msg: '❌ Server error during delete', error: err.message });
  }
};
