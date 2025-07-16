import express from 'express';
import Incident from '../models/Incident.js';

import {
  getAllReports,
  getMapData,
  deleteIncident,
  updateIncidentStatus
} from '../controllers/reportController.js';

import {
  register,
  login,
  approveAdmin,
  getAllDiscussions,
  getAllStories
} from '../controllers/authController.js';

const router = express.Router();

/* ===== AUTH ROUTES ===== */
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/approve/:token', approveAdmin);

/* ===== INCIDENT REPORT ROUTES ===== */
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

router.get('/admin/report', getAllReports);
router.get('/admin/report/map', getMapData);
router.put('/admin/report/:id/status', updateIncidentStatus);
router.delete('/admin/report/:id', deleteIncident);

/* ===== DISCUSSION & STORY ROUTES ===== */
// Admin routes
router.get('/admin/discussions', getAllDiscussions);
router.get('/admin/stories', getAllStories);

// 👇 Add public routes to match frontend fetch URLs
router.get('/discussions', getAllDiscussions);  // ✅ Match frontend: /api/discussions
router.get('/stories', getAllStories);          // ✅ Match frontend: /api/stories

export default router;
