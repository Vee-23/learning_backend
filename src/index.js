import dotenv from 'dotenv';
dotenv.config({path:'./env'});

import connectDB from './db_connections/index_db.js';
connectDB()

