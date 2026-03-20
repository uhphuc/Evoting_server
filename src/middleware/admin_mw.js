import jwt from "jsonwebtoken";

const adminMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    
    if (!token) {
        return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    
        // Check if the user is an admin
        if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
        }
    
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
}

export default adminMiddleware;