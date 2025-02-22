import express from 'express'

import { addDoctor, allDoctors, loginAdmin, appointmentAdmin , appointmentCancel} from '../Controllers/adminController.js'
import upload from '../Middlewares/multer.js'
import authAdmin from '../Middlewares/authAdmin.js'
import { changeAvailability } from '../Controllers/doctorController.js'



const adminRouter = express.Router()
adminRouter.post('/add-doctor',upload.single('image'), addDoctor)
adminRouter.post('/login', loginAdmin)
adminRouter.post('/all-doctors', allDoctors)
adminRouter.post('/change-availability',changeAvailability)
adminRouter.get('/appointments', appointmentAdmin)
adminRouter.post('/cancel-appointment', appointmentCancel)

export default adminRouter