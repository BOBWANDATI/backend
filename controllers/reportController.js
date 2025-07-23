import Incident from '../models/Incident.js';

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
        title: savedReport.incidentType,
        type: savedReport.incidentType,
        status: savedReport.status,
        date: savedReport.date,
        location: { lat, lng },
        locationName: savedReport.locationName || '',
        reporter: savedReport.reporter,
      });

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

// ❌ Delete Report by ID
export const deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findByIdAndDelete(id);

    if (!incident) {
      return res.status(404).json({ msg: '❌ Incident not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('incident_deleted', { id });
    }

    res.status(200).json({ msg: '✅ Incident deleted successfully', id });
  } catch (err) {
    console.error('❌ Error deleting incident:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// 📄 Get All Reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await Incident.find().sort({ createdAt: -1 });

    const formatted = reports.map(i => ({
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

    res.status(200).json({ msg: '✅ All reports fetched', data: formatted });
  } catch (err) {
    console.error('❌ Error fetching reports:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
