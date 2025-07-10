import express from 'express';
import Incident from '../models/incident.js';
import {
  getAllReports,
  getMapData,
  deleteIncident,
  updateIncidentStatus // ✅ Import the new controller
} from '../controllers/reportController.js';

const router = express.Router();

// ✅ GET: Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Incident.countDocuments();
    const pending = await Incident.countDocuments({ status: 'pending' });
    const resolved = await Incident.countDocuments({ status: 'resolved' });

    res.json({
      incidentsCount: total,
      pendingIncidents: pending,
      resolvedIncidents: resolved,
    });
  } catch (err) {
    console.error('❌ Error fetching stats:', err.message);
    res.status(500).json({ msg: '❌ Failed to load dashboard stats' });
  }
});

// ✅ GET: All incident reports
router.get('/report', getAllReports);

// ✅ GET: Incident map data (for map view)
router.get('/report/map', getMapData);

// ✅ PATCH: Update incident status
router.patch('/report/:id/status', updateIncidentStatus); // ✅ ADD THIS ROUTE

// ✅ DELETE: Delete incident
router.delete('/report/:id', deleteIncident);

export default router;
