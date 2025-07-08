import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  createReport,
  getAllReports,
  getMapData
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

// ✅ Updated route to match frontend
// ✅ New (matches frontend path exactly)
router.post('/api/report/submit', upload.array('files', 5), createReport);


// Other routes
router.get('/', getAllReports);
router.get('/map', getMapData);

export default router;
