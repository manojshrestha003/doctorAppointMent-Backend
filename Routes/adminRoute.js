import express from 'express'

import { addDoctor } from '../Controllers/adminController.js'
import upload from '../Middlewares/multer.js'

const adminRouter = express.Router()
adminRouter.post('/add-doctor',upload.single('image'), addDoctor)
export default adminRouter