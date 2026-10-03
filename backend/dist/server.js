"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // Load env vars before anything else
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const saleRoutes_1 = __importDefault(require("./routes/saleRoutes"));
const settingsRoutes_1 = __importDefault(require("./routes/settingsRoutes"));
// Connect to database
(0, db_1.default)();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/customers', customerRoutes_1.default);
app.use('/api/sales', saleRoutes_1.default);
app.use('/api/settings', settingsRoutes_1.default);
app.get('/', (req, res) => {
    res.send('API is running...');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
