import express from 'express';
import Incident from '../models/incident.js';
import {
  getAllReports,
  getMapData,
  deleteIncident,
  updateIncidentStatus
} from '../controllers/reportController.js';

import {
  register,
  login,
  approveAdmin
} from '../controllers/authController.js';

const router = express.Router();

/* ===== AUTH ROUTES ===== */
// Register Admin or Super Admin
router.post('/auth/register', register);

// Login Admin or Super Admin
router.post('/auth/login', login);

// Approve Admin (via email link with token)
router.get('/auth/approve/:token', approveAdmin);

/* ===== INCIDENT REPORT ROUTES ===== */
// GET: Dashboard Stats
router.get('/admin/stats', async (req, res) => {
  try {
    const total = await Incident.countDocuments();
    const pending = await Incident.countDocuments({ status: 'pending' });
    const resolved = await Incident.countDocuments({ status: 'resolved' });

    res.json({
      incidentsCount: total,
      pendingIncidents: pending,
      resolvedIncidents: resolved
    });
  } catch (err) {
    console.error('❌ Error fetching stats:', err.message);
    res.status(500).json({ msg: '❌ Failed to load dashboard stats' });
  }
});

// GET: Analytics Data (Line, Pie, Bar Charts)
router.get('/admin/analytics', async (req, res) => {
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

// GET: All Incident Reports
router.get('/admin/report', getAllReports);

// GET: Map Data
router.get('/admin/report/map', getMapData);

// PUT: Update Incident Status
router.put('/admin/report/:id/status', updateIncidentStatus);

// DELETE: Delete Incident
router.delete('/admin/report/:id', deleteIncident);

export default router;
