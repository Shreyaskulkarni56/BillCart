import express from 'express';
import {
    createSale,
    getSales,
    getSaleById,
    getTodaysSales,
    updateSale,
} from '../controllers/saleController';

const router = express.Router();

router.route('/').get(getSales).post(createSale);
router.route('/today').get(getTodaysSales);
router.route('/:id').get(getSaleById).put(updateSale);

export default router;
