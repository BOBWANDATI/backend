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
  updateIncidentStatus // ✅ NEW: Import the status update controller
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
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// ✅ Create new incident report with file uploads
router.post('/submit', upload.array('files', 5), createReport);

// ✅ Get all incident reports
router.get('/', getAllReports);

// ✅ Get map data and statistics
router.get('/map', getMapData);

// ✅ Admin can delete incident
router.delete('/:id', deleteIncident);

// ✅ Admin can update incident status (e.g., to 'resolved')
router.put('/incident/:id/status', updateIncidentStatus);

export default router;
