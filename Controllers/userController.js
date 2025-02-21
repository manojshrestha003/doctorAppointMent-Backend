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

const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    // Fetch doctor data
    const docData = await doctorModel.findById(docId).select('-password');
    if (!docData) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // Check if doctor is available
    if (docData.available === false) {
      return res.json({ success: false, message: "Doctor not available" });
    }

    // Copy slots_booked to prevent direct mutation
    let slots_booked = { ...docData.slots_booked };

    // Check slot availability
    if (slots_booked[slotDate]?.includes(slotTime)) {
      return res.json({ success: false, message: "Slot not available" });
    }

    // Update slots
    if (!slots_booked[slotDate]) {
      slots_booked[slotDate] = [];
    }
    slots_booked[slotDate].push(slotTime);

    // Fetch user data
    const userData = await userModel.findById(userId).select('-password');
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Remove slots_booked from docData before storing it in appointment
    const { slots_booked: _, ...filteredDocData } = docData.toObject();

    // Create new appointment object
    const appointmentData = {
      userId,
      docId,
      userData,
      docData: filteredDocData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: new Date(),
    };

    // Save appointment
    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Update doctor's booked slots
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment booked successfully" });

  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

//API to get appointment to my appointment page 
const listAppointment= async(req, res)=>{
  try {
    const {userId} = req.body;
    const appointments = await appointmentModel.find({userId})
    res.json({success:true, appointments})
    
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
    
  }
}

//api to  cancel appointment 
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;
    
    // Find appointment
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Verify appointment user
    if (appointmentData.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized action" });
    }

    // Mark appointment as cancelled
    await appointmentModel.findOneAndUpdate({ _id: appointmentId }, { cancelled: true });

    // Releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);
    if (!doctorData) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    let slots_booked = doctorData.slots_booked;
    if (slots_booked[slotDate]) {
      slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
    }

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment cancelled" });

  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



export {registerUser,userLogin, getProfile, updateProfile, bookAppointment,listAppointment, cancelAppointment}