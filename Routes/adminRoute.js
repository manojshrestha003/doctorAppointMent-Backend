import express from 'express'

import { addDoctor, allDoctors, loginAdmin } from '../Controllers/adminController.js'
import upload from '../Middlewares/multer.js'
import authAdmin from '../Middlewares/authAdmin.js'
import { changeAvailability } from '../Controllers/doctorController.js'



const adminRouter = express.Router()
adminRouter.post('/add-doctor',authAdmin,upload.single('image'), addDoctor)
adminRouter.post('/login', loginAdmin)
adminRouter.post('/all-doctors',  allDoctors)
adminRouter.post('./change-availability', changeAvailability)

export default adminRouter