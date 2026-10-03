import express from 'express';
import { getSettings, updateSettings, uploadLogo, removeLogo } from '../controllers/settingsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/upload-logo', uploadLogo);
router.delete('/logo', removeLogo);

export default router;
