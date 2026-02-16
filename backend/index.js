import express from 'express';
import connectDB from './config/db.js';

import dotenv from 'dotenv';


const app = express();
app.use(express.json());

dotenv.config();
connectDB();