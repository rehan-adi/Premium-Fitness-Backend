import express from 'express';
import cors from 'cors';
import env from 'dotenv';
import dbConnect from './config/dbConnect.js';
import authRouter from './routes/auth.routes.js';

env.config();
const server = express();

//database connection
dbConnect();

// Middleware
server.use(express.json());
server.use(cors());

// routes
server.use( "/user" ,authRouter);

server.listen(process.env.PORT || 2000, () => {
    console.log(`Server is running on port ${process.env.PORT || 2000}`);
});