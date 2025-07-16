import Incident from '../models/incident.js';

// 🚨 Create New Report + Emit Full List
export const createReport = async (req, res) => {
  try {
    const {
      incidentType,
      location,
      locationName,
      date,
      description,
      urgency,
      anonymous,
      followUp,
    } = req.body;

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
      location: { type: 'Point', coordinates: [lng, lat] },
      locationName: locationName || '',
      date: date || new Date(),
      description,
      urgency,
      status: 'pending',
      reporter: anonymous === 'true' || anonymous === true ? 'anonymous' : 'user',
      followUp: followUp === 'true' || followUp === true,
      files: req.files?.map(file => `/uploads/${file.filename}`) || [],
    });

    const savedReport = await newReport.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('new_incident_reported', {
        id: savedReport._id,
        type: savedReport.incidentType,
        status: savedReport.status,
        date: savedReport.date,
        location: { lat, lng },
        locationName: savedReport.locationName || '',
        reporter: savedReport.reporter,
      });
      console.log('📢 new_incident_reported emitted:', savedReport._id);

      // Emit full updated list to admin dashboard
      const allReports = await Incident.find().sort({ createdAt: -1 });
      const formattedReports = allReports.map(i => ({
        _id: i._id,
        incidentType: i.incidentType,
        locationName: i.locationName || '',
        coordinates: {
          lat: i.location?.coordinates?.[1] || '',
          lng: i.location?.coordinates?.[0] || '',
        },
        urgency: i.urgency,
        description: i.description,
        status: i.status,
        date: i.date,
        anonymous: i.reporter === 'anonymous',
        reportedBy: i.reporter,
      }));
      io.emit('all_incidents_update', formattedReports);
    }

    res.status(201).json({ msg: '✅ Report submitted successfully', data: savedReport });
  } catch (err) {
    console.error('❌ Error saving report:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// 📜 Get All Reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await Incident.find().sort({ createdAt: -1 });
    const formattedReports = reports.map(i => ({
      _id: i._id,
      incidentType: i.incidentType,
      locationName: i.locationName || '',
      coordinates: {
        lat: i.location?.coordinates?.[1] || '',
        lng: i.location?.coordinates?.[0] || '',
      },
      urgency: i.urgency,
      description: i.description,
      status: i.status,
      date: i.date,
      anonymous: i.reporter === 'anonymous',
      reportedBy: i.reporter,
    }));
    res.status(200).json(formattedReports);
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
      locationName: i.locationName || 'Unknown',
      reporter: i.reporter || 'anonymous',
      location: {
        lat: i.location.coordinates[1],
        lng: i.location.coordinates[0],
      },
    }));

    const stats = {
      pending: await Incident.countDocuments({ status: 'pending' }),
      resolved: await Incident.countDocuments({ status: 'resolved' }),
      investigating: await Incident.countDocuments({ status: 'investigating' }),
      escalated: await Incident.countDocuments({ status: 'escalated' }),
      total: incidents.length,
    };

    res.status(200).json({ incidents: formattedIncidents, stats });
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

      // Emit updated list after delete
      const allReports = await Incident.find().sort({ createdAt: -1 });
      const formattedReports = allReports.map(i => ({
        _id: i._id,
        incidentType: i.incidentType,
        locationName: i.locationName || '',
        coordinates: {
          lat: i.location?.coordinates?.[1] || '',
          lng: i.location?.coordinates?.[0] || '',
        },
        urgency: i.urgency,
        description: i.description,
        status: i.status,
        date: i.date,
        anonymous: i.reporter === 'anonymous',
        reportedBy: i.reporter,
      }));
      io.emit('all_incidents_update', formattedReports);
    }

    res.status(200).json({ msg: '✅ Incident deleted successfully' });
  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).json({ msg: '❌ Server error during delete', error: err.message });
  }
};

// 🔄 Update Incident Status + Emit
export const updateIncidentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'resolved', 'investigating', 'escalated'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: `❌ Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ msg: '❌ Incident not found.' });
    }

    incident.status = status;
    await incident.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('incident_updated', {
        id: incident._id,
        type: incident.incidentType,
        status: incident.status,
        date: incident.date,
        locationName: incident.locationName || 'Unknown',
        reporter: incident.reporter || 'anonymous',
        location: {
          lat: incident.location.coordinates[1],
          lng: incident.location.coordinates[0],
        },
      });
      console.log('🔄 incident_updated emitted:', incident._id);

      // Emit updated list after status update
      const allReports = await Incident.find().sort({ createdAt: -1 });
      const formattedReports = allReports.map(i => ({
        _id: i._id,
        incidentType: i.incidentType,
        locationName: i.locationName || '',
        coordinates: {
          lat: i.location?.coordinates?.[1] || '',
          lng: i.location?.coordinates?.[0] || '',
        },
        urgency: i.urgency,
        description: i.description,
        status: i.status,
        date: i.date,
        anonymous: i.reporter === 'anonymous',
        reportedBy: i.reporter,
      }));
      io.emit('all_incidents_update', formattedReports);
    }

    res.status(200).json({ msg: '✅ Status updated successfully', incident });
  } catch (err) {
    console.error('❌ Error updating status:', err);
    res.status(500).json({ msg: '❌ Server error updating status', error: err.message });
  }
};
