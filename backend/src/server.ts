import 'dotenv/config'; // Load env vars before anything else
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import connectDB from './config/db';

import productRoutes from './routes/productRoutes';
import customerRoutes from './routes/customerRoutes';
import saleRoutes from './routes/saleRoutes';


// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());

const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:5173',
    'https://bill-cart.vercel.app',
    process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
    cors({
        origin: allowedOrigins.length > 0 ? allowedOrigins : true,
        credentials: true,
    })
);
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', saleRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
