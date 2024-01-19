import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser'

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "20kb"}));
app.use(express.urlencoded({extended: true, limit:"20kb"}));
app.use(express.static("public"));
app.use(cookieParser())

//routes
import router from './routes/user.routes.js';

//routes declaration
app.use("/api/v1/users", router)
app.post("/api/v1/test", (req,res)=>{
console.log("working...")
res.json({
    message:"okay i am there."
})
})


export { app }