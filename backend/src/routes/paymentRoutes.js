import express from 'express';
import { 
  requestPaymentApproval, 
  approvePayment, 
  rejectPayment, 
  getPendingApprovals 
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/request-approval', requestPaymentApproval);
router.post('/approve', approvePayment);
router.post('/reject', rejectPayment);
router.get('/pending-approvals', getPendingApprovals);

export default router;
