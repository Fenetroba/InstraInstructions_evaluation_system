import express from "express";
import { protect, authorize } from "../Middleware/protect.js";
import { deleteUser, editUser, fetchAllUser, fetchUserSingle } from "../Controller/UserData.Controller.js";

const router = express.Router();

// Apply both protect and authorize middlewares
router.get('/', protect, authorize('department_head','quality_officer'), fetchAllUser);
router.delete('/delete-user/:id', protect, authorize('department_head'), deleteUser);
router.put('/edit-user/:id', protect, authorize('department_head'), editUser);
router.get('/search-user', protect, authorize('department_head'), fetchUserSingle);


export default router;