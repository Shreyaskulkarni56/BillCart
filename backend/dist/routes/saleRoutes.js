"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const saleController_1 = require("../controllers/saleController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.route('/').get(saleController_1.getSales).post(saleController_1.createSale);
router.route('/today').get(saleController_1.getTodaysSales);
router.route('/:id').get(saleController_1.getSaleById).put(saleController_1.updateSale);
exports.default = router;
