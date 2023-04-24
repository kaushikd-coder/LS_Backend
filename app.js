import express from 'express';
import errorHandler from './middleware/error.js';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import dotenv from 'dotenv';
import cors from 'cors';

const app = express();

dotenv.config({
    path:'config/config.env'
});

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Route Imports
import productRoutes from './routes/productRoute.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoute.js';
import paymentRoutes from './routes/paymentRoute.js';

app.use('/api/v1', productRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', orderRoutes);
app.use('/api/v1', paymentRoutes);

// Middleware for Error Handling
app.use(errorHandler)


export default app;