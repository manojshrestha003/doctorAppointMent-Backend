import jwt from 'jsonwebtoken';

// Admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        const atoken = req.headers.authorization?.split(" ")[1]; // Extract token correctly
        if (!atoken) {
            return res.json({ success: false, message: "Not authorized. Login again." });
        }

        const tokenDecode = jwt.verify(atoken, process.env.JWT_SECRET );

        if (tokenDecode.email !== process.env.ADMIN_EMAIL) { // Validate admin email
            return res.json({ success: false, message: "Not authorized. Login again." });
        }

        next(); // Proceed to the next middleware

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

export default authAdmin;
