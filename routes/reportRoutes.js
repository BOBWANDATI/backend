import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import {
  createReport,
  getAllReports,
  getMapData,           // <-- make sure this is defined in the controller
  deleteIncident,
  updateIncidentStatus  // <-- make sure this is defined in the controller
} from '../controllers/reportController.js';

const router = express.Router();

// ✅ Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

/**
 * ROUTES
 */

// ✅ Submit new incident report with file upload
router.post('/submit', upload.array('files', 5), createReport);

// ✅ Get all incident reports (for admin panel)
router.get('/', getAllReports);

// ✅ Get map data and stats (for dashboard/map view)
router.get('/map', getMapData);

// ✅ Update the status of an incident
router.put('/:id/status', updateIncidentStatus);

// ✅ Delete an incident
router.delete('/:id', deleteIncident);

export default router;
