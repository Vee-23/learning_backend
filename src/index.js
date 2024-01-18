import dotenv from 'dotenv';
import { app } from './app.js';
dotenv.config({path:'./env'});

import connectDB from './db_connections/index_db.js';
connectDB()
  .then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Listening succesfully on Port ${process.env.PORT}`)
    })
  })
  .catch((error)=>{
    console.log("mongodb connection has failed",error)
  })

