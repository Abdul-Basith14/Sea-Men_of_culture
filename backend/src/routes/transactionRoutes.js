import express from 'express';
import { getAllTransactions, getMemberTransactions } from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // Protect all transaction routes

router.get('/', getAllTransactions);
router.get('/member/:id', getMemberTransactions);

export default router;
