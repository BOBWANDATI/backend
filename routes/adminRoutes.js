import express from 'express';
import Incident from '../models/Incident.js';

import {
  register,
  login,
  approveAdmin,
  getAllDiscussions,
  getAllStories,
  getAllIncidents,
  deleteDiscussion,
  deleteStory
} from '../controllers/authController.js';

import {
  getAllReports,
  getMapData,
  deleteIncident,
  updateIncidentStatus
} from '../controllers/reportController.js';


import express from 'express';
import {
  getAllNews,
  updateNewsStatus,
  deleteNews,
  // ... other controllers
} from '../controllers/authController.js';

const router = express.Router();

router.get('/news', getAllNews); // ✅ must exist
router.patch('/news/:id/verify', updateNewsStatus); // ✅ needed to change status
router.delete('/news/:id', deleteNews); // ✅ needed to delete

//export default router;



const router = express.Router();

/* ========== AUTH ROUTES ========== */
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/approve/:token', approveAdmin);

/* ========== PUBLIC FRONTEND ROUTES ========== */
router.get('/incident', getAllIncidents);         // View all public incidents
router.get('/discussions', getAllDiscussions);    // Public discussions
router.get('/stories', getAllStories);            // Public stories

/* ========== ADMIN DASHBOARD ROUTES ========== */

// 📊 Dashboard summary stats
router.get('/stats', async (req, res) => {
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

// 📈 Admin analytics data (line, pie, bar charts)
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

/* ========== ADMIN INCIDENT CONTROLS ========== */
router.get('/report', getAllReports);                                // View all incident reports
router.get('/admin/report/map', getMapData);                         // Map view
//router.patch('/admin/report/:id/status', updateIncidentStatus);     // ✅ PATCH to update status
router.patch('/report/:id/status', updateIncidentStatus);

//router.delete('/admin/report/:id', deleteIncident);                  // ✅ DELETE incident
// In adminRoutes.js
router.delete('/report/:id', deleteIncident);






/* ========== ADMIN DISCUSSION & STORY CONTROLS ========== */
//router.delete('/admin/discussions/:id', deleteDiscussion);           // ✅ DELETE discussion
router.delete('/discussions/:id', deleteDiscussion);
//router.delete('/admin/stories/:id', deleteStory);                    // ✅ DELETE story
router.delete('/stories/:id', deleteStory);

export default router;
