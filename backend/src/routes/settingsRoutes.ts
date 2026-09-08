import express from 'express';
import { getSettings, updateSettings, uploadLogo, removeLogo } from '../controllers/settingsController';

const router = express.Router();

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/upload-logo', uploadLogo);
router.delete('/logo', removeLogo);

export default router;
