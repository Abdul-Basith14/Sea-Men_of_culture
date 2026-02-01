import express from 'express';
import { 
  createProduct, 
  getAllProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct, 
  markProductAsSold 
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', upload.single('productImage'), createProduct);
router.get('/', getAllProducts);
router.get('/search', getAllProducts); // Same handler, uses query params
router.get('/:id', getProductById);
router.put('/:id', upload.single('productImage'), updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/sell', markProductAsSold);

export default router;
