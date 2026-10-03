"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const settingsController_1 = require("../controllers/settingsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.get('/', settingsController_1.getSettings);
router.put('/', settingsController_1.updateSettings);
router.post('/upload-logo', settingsController_1.uploadLogo);
router.delete('/logo', settingsController_1.removeLogo);
exports.default = router;
