import validator from 'validator'
import bycrypt from 'bcrypt'
import userModel from '../Models/userModel.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../Models/doctorModel.js'
import appointmentModel from '../Models/appointModel.js'
//Api to register user


const registerUser = async (req, res)=>{
    try {
       const {name, email, password} = req.body
       if(!name || !password || !email)
       {
        return res.json({success:false, message:"Missing details "})
       }
        
       if(!validator.isEmail(email)){
        return res.json({success:false, message:"Enter a valid email "})

       }

       //Validating strong password
       if(password.length<8){
        return res.json({success:false, message:"Enter a strong password "})
       }

       //Hashing user password
      const salt= await bycrypt.genSalt(10)
      const hashedPassword = await bycrypt.hash(password, salt);
      const userData = {
        name,
        email,
        password:hashedPassword
      }
      
      const newUser = new userModel(userData)
      const  user = await newUser.save();

      const token=  jwt.sign({id:user._id}, process.env.JWT_SECRET)

      res.json({success:true, token})
    } catch (error) {

        console.log(error);
        res.json({success:false, message: error.message})
        
    }
}
const userLogin  = async(req, res) =>{
  try {
    const {email, password} = req.body;
    const user = await userModel.findOne({email})
    if(!user)
    {
      
    return res.json({success:false, message: "User doesnot exist"})
    }
    const isMatch  = await bycrypt.compare(password, user.password)
    if(isMatch){
      const token  = jwt.sign({id:user._id,  }, process.env.JWT_SECRET)
      res.json({success:true, token})
    }
    else{
      res.json({success:false, message:"Invalid credentials"})
    }
    
  } catch (error) {
    console.log(error);
    res.json({success:false, message: error.message})
    
  }
}

//api to get user profile data 
const getProfile = async (req, res) => {
  try {
      const { userId } = req.body;
      const userData = await userModel.findById(userId).select('-password');

      if (!userData) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      return res.json({ success: true, userData });
  } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: "Server error" });
  }
};

//Api to update userProfile

const updateProfile = async(req, res)=>{
  try {
    const {userId, name, phone, address, dob , gender} = req.body;
    const imageFile = req.file
    if( !name || !phone ||  !address || !dob || !gender){
      return res.json({success:false, message:"data missing"})
    }
    await userModel.findByIdAndUpdate(userId, {name, phone, address:JSON.parse(address), dob, gender})
    if(imageFile){
      //upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:'image'})
      const imageUrl  = imageUpload.secure_url
      await userModel.findByIdAndUpdate(userId, {image:imageUrl})
    }
    res.json({success:true, message:"profile updated"})

  } catch (error) {
    console.log(error);
      return res.status(500).json({ success: false, message: "Server error" });

    
  }
}

//api to book aappintment

const bookAppointment = async(req, res)=>{
  try {
    const {userId, docId, slotDate, slotTime} = req.body;
     const docData = await  doctorModel.findById(docId).select('-password')
      if(!docData.available){
        return res.json({success:false, message:"doctor not available"})
      }
      let slots_booked = docData.slots_booked
      //Checking slots avalilability
      if(slots_booked[slotDate]){
        if(slots_booked[slotDate].include(slotTime)){
          return res.json({success:false, message:"Slot not available"})
        }
        else{
          slots_booked[slotDate].push(slotTime)
        }
      }else{
        slots_booked[slotDate]=[]
        slots_booked[slotDate].push(slotTime)
      }
    const userData = await userModel.findById(userId).select('-password')
    
    delete docData.slots_booked

    const appointmentData= {
      userId,
      docId,
      userData,
      docData,
      amount:docData.fees,
      slotTime,
      slotDate,
      date: Date.now()

    }
    const newAppointment = new appointmentModel(appointmentData)
    await newAppointment.save()

    //save new slots data and doctors data 
    await doctorModel.findByIdAndUpdate(docId, {slots_booked})
    res.json({success:ture, message:'appointment Booked '})

  } catch (error) {
    console.log(error);
      return res.status(500).json({ success: false, message: "Server error" });
    
  }
}

export {registerUser,userLogin, getProfile, updateProfile}