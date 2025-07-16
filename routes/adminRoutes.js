import express from 'express';
import Incident from '../models/Incident.js';
import {
  register,
  login,
  approveAdmin,
  getAllDiscussions,
  getAllStories,
  getAllIncidents,
  createDiscussion,
  createStory,
  createIncident
} from '../controllers/authController.js';

import {
  getAllReports,
  getMapData,
  deleteIncident,
  updateIncidentStatus
} from '../controllers/reportController.js';

const router = express.Router();

/* ===== AUTH ROUTES ===== */
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/approve/:token', approveAdmin);

/* ===== FRONTEND PUBLIC ROUTES ===== */
// Create Incident Report (User-side)
router.post('/incident', createIncident);
router.get('/incident', getAllIncidents);

// Create & Get Public Discussions
router.post('/discussions', createDiscussion);
router.get('/discussions', getAllDiscussions);

// Create & Get Public Stories
router.post('/stories', createStory);
router.get('/stories', getAllStories);

/* ===== ADMIN DASHBOARD ROUTES ===== */
// Dashboard Stats
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

// Dashboard Charts (Line, Pie, Bar)
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
      { $project: { date: '$_id', count: 1, _id: 0 } }
    ]);

    const statusCounts = await Incident.aggregate([
      { $group: { _id: '$status', value: { $sum: 1 } } },
      { $project: { name: '$_id', value: 1, _id: 0 } }
    ]);

    const locationCounts = await Incident.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $project: { location: '$_id', count: 1, _id: 0 } },
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

// Admin Incident Controls
router.get('/admin/report', getAllReports);
router.get('/admin/report/map', getMapData);
router.put('/admin/report/:id/status', updateIncidentStatus);
router.delete('/admin/report/:id', deleteIncident);

export default router;
