"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // Load env vars before anything else
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const PORT = process.env.PORT || 5000;
// Connect to database for traditional Node.js hosting (e.g. Render)
(0, db_1.default)()
    .then(() => {
    app_1.default.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error(`Failed to connect to MongoDB: ${err.message}`);
    // Keep listening so health check endpoint can still be reached
    app_1.default.listen(PORT, () => {
        console.log(`Server running in degraded mode on port ${PORT}`);
    });
});
