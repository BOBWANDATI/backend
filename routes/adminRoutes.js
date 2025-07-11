import express from 'express';
import Incident from '../models/incident.js';
import {
  getAllReports,
  getMapData,
  deleteIncident,
  updateIncidentStatus
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

// ✅ GET: Analytics Data (Charts)
router.get('/analytics', async (req, res) => {
  try {
    const incidents = await Incident.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    const statusCounts = await Incident.aggregate([
      {
        $group: {
          _id: '$status',
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          _id: 0
        }
      }
    ]);

    const locationCounts = await Incident.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          location: '$_id',
          count: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      line: incidents,
      pie: statusCounts,
      bar: locationCounts
    });
  } catch (err) {
    console.error('❌ Error fetching analytics data:', err.message);
    res.status(500).json({ msg: '❌ Failed to load analytics data' });
  }
});

// ✅ GET: All incident reports
router.get('/report', getAllReports);

// ✅ GET: Incident map data (for map view)
router.get('/report/map', getMapData);

// ✅ PATCH: Update incident status
router.patch('/report/:id/status', updateIncidentStatus);

// ✅ DELETE: Delete incident
router.delete('/report/:id', deleteIncident);

export default router;
