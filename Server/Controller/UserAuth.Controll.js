import UserAuth from "../Model/UserAuth.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
  

    const { fullName, username, password, role, department,email } = req.body;

    // Check if user already exists
    const existingUser = await UserAuth.findOne({ username });
    const existingEmail = await UserAuth.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create user
    const user = await UserAuth.create({
      fullName,
      username,
      password,
      email,
      role,
      department,
    });

   

    user.password = undefined;

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Please provide username and password" });
    }

    // Check if user exists
    const user = await UserAuth.findOne({ username }).select("+password");
    console.log(user)
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if password is correct
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if password is default
    const isDefaultPassword = await user.matchPassword("Osu@1234");

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        isDefaultPassword // Include in JWT payload if needed for authorization
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );
    const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure in production
            sameSite: 'lax', // Changed from 'strict' to 'lax' for better cross-site compatibility
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined // Set your domain in production
        };
                res.cookie('token', token, cookieOptions);
    // Update last login
//     await user.updateLastLogin();

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      user: {
        ...user._doc,
        isDefaultPassword
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};
export const getMe = async (req, res) => {
  try {
    const user = await UserAuth.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserAuth.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate and hash reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset token
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/resetpassword/${resetToken}`;

    res.status(200).json({
      success: true,
      data: "Email sent with reset instructions",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    const user = await UserAuth.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      fullName: req.body.fullName,
      email: req.body.email,
    };

    const user = await UserAuth.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Update details error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// @desc    Update user password
// @route   PUT /api/auth/update-password/:userId
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.userId;
    
    // 1. Find the user with password field
    const user = await UserAuth.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // 2. Verify current password using model method
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Current password is incorrect' 
      });
    }
    
    // 3. Update password and clear default password flag
    user.password = newPassword;
    user.isDefaultPassword = false; // Clear the default password flag
    await user.save();
    
    // 4. Generate new JWT token
    const token = user.getSignedJwtToken();
    
    res.status(200).json({ 
      success: true,
      message: 'Password updated successfully',
      token
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
export const logout = async (req, res) => {
    try {
        // Clear the token cookie
        res.clearCookie('token');
        res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred during logout",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
