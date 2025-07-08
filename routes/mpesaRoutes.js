// mpesaRoutes.js
import express from 'express';
import { stkPush } from '../controllers/mpesaController.js';

const router = express.Router();

router.post('/stk', stkPush);

export default router;
