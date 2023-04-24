import dotenv from 'dotenv';
import app from './app.js';
import connectDb from './config/database.js';
import cloudinary from 'cloudinary';

//* Handling Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to Uncaught Exception");
    process.exit(1);
})

// Configuration
dotenv.config({
    path:'config/config.env'
});

// Database Connection
connectDb();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

app.get('/', (req, res) => {
    res.send("Welcome to the Server")
})


const server = app.listen(process.env.PORT, () => {
    console.log(`Server is listening at http://localhost:${process.env.PORT}`)
})

//* Unhandled Promise Rejection
process.on('uncaughtException',(err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the Server due to Unhandled Promise Rejection');

    server.close(() => {
        process.exit(1);
    })
})