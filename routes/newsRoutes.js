// routes/newsRoutes.js
import express from 'express';
import { getAllNews, getSingleNews, postNews } from '../controllers/newsController.js';

const router = express.Router();

router.get('/', getAllNews);
router.get('/:id', getSingleNews);
router.post('/', postNews);

export default router;
