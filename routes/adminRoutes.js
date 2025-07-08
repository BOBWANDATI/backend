// routes/adminRoutes.js

import express from 'express';
const router = express.Router();

// ✅ Import Models & Controllers
import Incident from '../models/incident.js'; // ✅ Make sure the model file is named `incident.js`
import {
  getAllReports,
  getMapData,
  createReport,
  deleteIncident
} from '../controllers/reportController.js';

// ✅ GET: All incident reports
router.get('/report', getAllReports);

// ✅ GET: Map data (optional, include if used on admin side)
router.get('/report/map', getMapData);

// ✅ GET: Dashboard stats (mocked for now)
router.get('/stats', (req, res) => {
  res.json({
    reportsCount: 5,
    newsCount: 10,
    incidentsCount: 3,
    dialoguesCount: 4,
    messagesCount: 6,
    storiesCount: 2,
  });
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

// ✅ DELETE: Delete incident
router.delete('/report/:id', deleteIncident);

export default router;
