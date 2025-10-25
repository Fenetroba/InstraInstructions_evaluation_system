import UserAuth from "../Model/UserAuth.model.js";

//avalable for department head
export const fetchUserSingle = async (req, res) => {
  try {
    const user = await UserAuth.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const deleteUser = async (req, res) => {
  try {
    const user = await UserAuth.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// In UserData.Controller.js
export const editUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if username is being updated and if it already exists
    if (updateData.username) {
      const existingUser = await UserAuth.findOne({ 
        username: updateData.username,
        _id: { $ne: id } // Exclude current user from the check
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
    }

    const updatedUser = await UserAuth.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};
export const fetchAllUser = async (req, res) => {
  try {
    const user = await UserAuth.find();
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
