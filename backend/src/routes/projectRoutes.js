import express from 'express';
import { 
  createProject, 
  getAllProjects, 
  getProjectById, 
  updateProject, 
  deleteProject, 
  markProjectComplete 
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', upload.single('projectImage'), createProject);
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.put('/:id', upload.single('projectImage'), updateProject);
router.delete('/:id', deleteProject);
router.patch('/:id/complete', markProjectComplete);

export default router;
