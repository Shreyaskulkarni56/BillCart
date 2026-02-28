import express from 'express';
import {
    createSale,
    getSales,
    getSaleById,
    getTodaysSales,
} from '../controllers/saleController';

const router = express.Router();

router.route('/').get(getSales).post(createSale);
router.route('/today').get(getTodaysSales);
router.route('/:id').get(getSaleById);

export default router;
