import 'dotenv/config'; // Load env vars before anything else
import app from './app';
import connectDB from './config/db';

const PORT = process.env.PORT || 5000;

// Connect to database for traditional Node.js hosting (e.g. Render)
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error(`Failed to connect to MongoDB: ${err.message}`);
        // Keep listening so health check endpoint can still be reached
        app.listen(PORT, () => {
            console.log(`Server running in degraded mode on port ${PORT}`);
        });
    });
