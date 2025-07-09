import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import {
  createReport,
  getAllReports,
  getMapData,
  deleteIncident,
  updateIncidentStatus
} from '../controllers/reportController.js';

const router = express.Router();

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

/**
 * ROUTES
 */

// ✅ Create a new incident report with file uploads
router.post('/submit', upload.array('files', 5), createReport);

// ✅ Get all incident reports
router.get('/', getAllReports);

// ✅ Get map data and stats
router.get('/map', getMapData);

// ✅ Delete an incident by ID
router.delete('/:id', deleteIncident);

// ✅ Update incident status by ID (for Admins)
router.put('/:id/status', updateIncidentStatus);

export default router;
