import express from 'express';
import { getAllUsers, getUserById, updateUser, getUserFinancials, getProjectAnalytics, resetUserFinancials } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', upload.single('profileImage'), updateUser);
router.get('/:id/financials', getUserFinancials);
router.get('/:id/project-analytics', getProjectAnalytics);
router.post('/:id/reset', resetUserFinancials);

export default router;
