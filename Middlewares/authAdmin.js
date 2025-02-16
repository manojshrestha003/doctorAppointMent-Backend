import jwt from 'jsonwebtoken'

//Admin authenticcation midelware 
const authAdmin  = async (req, res, next) =>{
    try {
        const {atoken} = req.headers
        if(!atoken){
            res.json({success:false, message:"not authorized login again "})
        }
        const tokenDecode= jwt.verify(atoken, process.env.JWT_SECRET)
        if(tokenDecode !== process.env.ADMIN_EMAIL+process.env.ADMIN_PASSWORD){
            res.json({success:false, message:"not authorized login again "})
        }
        next()
        
    } catch (error) {
        console.log(error);
        res.json({success:false, message: error.message})
        
        
    }

}
export default authAdmin