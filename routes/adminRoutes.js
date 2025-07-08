import express from 'express';
const router = express.Router();

import Incident from '../models/incident.js';
import {
  getAllReports,
  getMapData,
  deleteIncident
} from '../controllers/reportController.js';

// ✅ GET: All incident reports
router.get('/report', getAllReports);

// ✅ GET: Map data (optional, for admin map view)
router.get('/report/map', getMapData);

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
    console.error('❌ Error fetching stats:', err);
    res.status(500).json({ msg: '❌ Failed to load dashboard stats' });
  }
});

// ✅ PATCH: Update Incident Status
router.patch('/report/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'investigating', 'resolved', 'escalated'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: '❌ Invalid status value' });
    }

    const updatedIncident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedIncident) {
      return res.status(404).json({ msg: '❌ Incident not found' });
    }

    // 🔴 Emit update using Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('incident_updated', updatedIncident);
    }

    res.json({
      msg: `✅ Status updated to '${status}'`,
      incident: updatedIncident
    });
  } catch (err) {
    console.error('❌ Error updating incident status:', err);
    res.status(500).json({ msg: '❌ Server error' });
  }
});

// ✅ DELETE: Delete Incident
router.delete('/report/:id', deleteIncident);

export default router;
