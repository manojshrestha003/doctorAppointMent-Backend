
import validator from 'validator'
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../Models/doctorModel.js'
import jwt from 'jsonwebtoken'
//API for adding doctor 
const addDoctor  = async (req, res)=>{
    try {
        const {name, email, password, speciality, degree, experience, about , fees, address} = req.body
        const imageFile  = req.file;

        //Checking for all data  to add  doctor 
        if(!name || !email || !password|| !speciality|| !degree|| !experience||
            !about||!fees||!address)
        {
           return res.json({success:false, message:"Missing Details"})
        }
        //validating email format 
        if(!validator.isEmail(email)){
            return res.json({success:false, message:"Please Enter a valid Email "})
        }
        //Validating password
        if(password.length<8){
            return res.json({success:false, message:"Please enter a strong password"})
        }

        //Hashing password
        const salt  = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        //upload imag to cloudinary 
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:"image"})
        const  imageUrl  = imageUpload.secure_url


        const doctorData = {
            name, 
            email,
             image:imageUrl,
             password:hashedPassword,
             speciality,
             degree, 
             experience,
             about,
             fees,
             address:JSON.parse(address),
             date:Date.now()
        }

        const newDoctor  = new doctorModel(doctorData)
        await newDoctor.save()

        res.json({success:true, message: "doctor added "})

    } catch (error) {
        console.log(error);
        res.json({success:false, message: error.message})
        
        
    }
}

//Api for admin login 
const loginAdmin  = async (req,res)=>{

    try {
        const {email , password}= req.body
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD ){
            const token  =jwt.sign(email+password, process.env.JWT_SECRET)
            res.json({success:true, token})


        }else{
            res.json({success:false, message:"invalid credentials"})
        }

        
    } catch (error) {
        console.log(error);
        res.json({success:false, message: error.message})
        
    }
}

//api to get all doctor list 
const allDoctors = async (req, res) => {
    try {
      const doctors = await doctorModel.find({}).select('-password');
      return res.status(200).json({ success: true, doctors });
    } catch (error) {
      console.error("Error fetching doctors:", error);
      return res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
  };
  

export {addDoctor, loginAdmin, allDoctors}