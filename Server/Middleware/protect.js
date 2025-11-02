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
    // If no roles are specified, allow access
    if (!roles || roles.length === 0) {
      return next();
    }
    
    // Check if user's role is included in the allowed roles
    // Convert roles to array if it's not already
    const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;
    
    if (!allowedRoles.includes(req.user.role)) {
      console.log(`Access denied. User role: ${req.user.role}, Allowed roles:`, allowedRoles);
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    
    next();
  };
};