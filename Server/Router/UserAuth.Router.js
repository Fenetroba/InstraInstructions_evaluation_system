import express from "express";
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout,

} from "../Controller/UserAuth.Controll.js";
import { protect } from "../Middleware/protect.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);

// Protected routes (require authentication)
router.use(protect); // This will protect all routes below

router.get("/profile", getMe);
router.put("/updatedetails", updateDetails);
router.put("/updatepassword", updatePassword);
router.post("/logout", logout);


export default router;