// middleware/auth.js
import jwt from "jsonwebtoken";
import UserAuth from "../Model/UserAuth.model.js";

// Protect routes
export const protect = async (req, res, next) => {

    const token = req.cookies?.token;

    if (!token) {
        // If not in cookies, try Authorization header (for backward compatibility)
        const authHeader = req.headers['authorization'];
        const authToken = authHeader && authHeader.split(' ')[1];
        
        if (!authToken) {
            return res.status(401).json({ 
                success: false,
                message: 'Access token required' 
            });
        }
        
        // Verify the token from header
        return jwt.verify(authToken, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ 
                    success: false,
                    message: 'Invalid or expired token' 
                });
            }
            req.user = user;
            next();
        });
    }

    // Verify the token from cookie
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false,
                message: 'Invalid or expired token' 
            });
        }
        req.user = user;
        next();
    });
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};