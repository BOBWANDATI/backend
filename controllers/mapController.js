const Incident = require('../models/incident');

exports.getMapData = async (req, res) => {
  try {
    const incidents = await Incident.find().lean();

    const formatted = incidents.map(inc => ({
      type: inc.incidentType,
      status: inc.status,
      date: inc.date,
      location: {
        lat: inc.location.coordinates[1],
        lng: inc.location.coordinates[0],
      }
    }));

    const stats = {
      total: incidents.length,
      pending: incidents.filter(i => i.status === 'pending').length,
      resolved: incidents.filter(i => i.status === 'resolved').length,
      investigating: incidents.filter(i => i.status === 'investigating').length,
      escalated: incidents.filter(i => i.status === 'escalated').length,
    };

    res.json({ incidents: formatted, stats });
  } catch (err) {
    console.error('❌ Error fetching map data:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
