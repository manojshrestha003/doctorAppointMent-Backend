import express from 'express'
import cors from 'cors'
import 'dotenv/config' 
import  connectDb from './config/MongoDb.js';
import connectCloudinary from './config/Cloudinary.js';
import adminRouter from './Routes/adminRoute.js';

import doctorRouter from './Routes/doctorRoute.js';
import userRouter from './Routes/userRoutes.js';

//App Config
const app = express();
const port = process.env.PORT || 4000
connectDb()
connectCloudinary()
//Middlewares
app.use(express.json())
app.use(cors())//allows frontend to connect with backend

//api endPoint
app.use('/api/admin', adminRouter)
//localhost:4000/api/admin
app.use('/api/doctor', doctorRouter)

app.use('/api/user', userRouter)


app.get('/', (req,res)=>{
    res.send("Api wroking great")
})

app.listen(port, (req, res)=>{
    console.log("Server started ", port)

})