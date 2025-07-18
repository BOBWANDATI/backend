import express from 'express';
const router = express.Router(); // ✅ Declare FIRST before using

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

import {
  getAllNews,
  updateNewsStatus,
  deleteNews
} from '../controllers/authController.js';


import { getAllStories, updateStoryStatus, deleteStory } from '../controllers/adminStoryController.js';


/* ========== AUTH ROUTES ========== */
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/approve/:token', approveAdmin);

/* ========== PUBLIC FRONTEND ROUTES ========== */
router.get('/incident', getAllIncidents);         
router.get('/discussions', getAllDiscussions);    
router.get('/stories', getAllStories);            

/* ========== ADMIN DASHBOARD ROUTES ========== */
router.get('/news', getAllNews);                            // ✅ Get all news
router.put('/news/:id/status', updateNewsStatus);           // ✅ Verify/Reject
router.delete('/news/:id', deleteNews);                     // ✅ Delete news

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
router.get('/report', getAllReports);
router.get('/admin/report/map', getMapData);
router.patch('/report/:id/status', updateIncidentStatus);
router.delete('/report/:id', deleteIncident);

/* ========== ADMIN DISCUSSION & STORY CONTROLS ========== */
router.delete('/discussions/:id', deleteDiscussion);
router.delete('/stories/:id', deleteStory);



router.get('/stories', protectAdmin, getAllStories);
router.put('/stories/:id/status', protectAdmin, updateStoryStatus);
router.delete('/stories/:id', protectAdmin, deleteStory);

export default router;
