import jwt from 'jsonwebtoken'

// User authentication middleware
const authUser = async (req, res, next) => {
    try {
        // Get token from headers
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Not authorized. Please log in." });
        }

        // Extract token from "Bearer <token>"
        const token = authHeader.split(" ")[1];

        // Verify token
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = token_decode.id;

        next(); // Call next middleware
    } catch (error) {
        console.log(error);
        return res.status(401).json({ success: false, message: "Invalid token. Please log in again." });
    }
};

export default authUser;