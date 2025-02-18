
import  express from 'express'
import { doctorList } from '../Controllers/doctorController.js'


const doctorRouter = express.Router()



doctorRouter.get('/list', doctorList)

export default doctorRouter