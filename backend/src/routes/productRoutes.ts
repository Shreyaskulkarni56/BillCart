import express from 'express';
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
} from '../controllers/productController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.route('/').get(getProducts).post(createProduct);
router.route('/low-stock').get(getLowStockProducts);
router.route('/:id').put(updateProduct).delete(deleteProduct);

export default router;
