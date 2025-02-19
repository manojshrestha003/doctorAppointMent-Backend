import express from 'express'

import { getProfile, registerUser, userLogin ,updateProfile} from '../Controllers/userController.js'
import authUser from '../Middlewares/authUser.js'
import upload from '../Middlewares/multer.js'


const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', userLogin)
userRouter.get('/get-profile', authUser, getProfile);
userRouter.post('/update-profile',upload.single('image'),authUser,updateProfile )

export default userRouter