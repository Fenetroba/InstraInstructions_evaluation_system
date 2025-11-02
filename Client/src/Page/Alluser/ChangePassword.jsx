import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Osu from "@/assets/Osu.png";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { updateUserPassword } from "@/Store/UsersDataSlice";
import { logoutUser } from "@/Store/AuthUserSlice";
import { FiLogOut } from "react-icons/fi";

const ChangePassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    currentPassword: "Osu@1234",
    newPassword: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  // Function to get dashboard path based on user role
  const getDashboardPath = (role) => {
    const roleMap = {
      'quality_officer': '/quality-office-home',
      'instructor': '/instructor-home',
      'department_head': '/department-head-home',
      'department head': '/department-head-home',
      'college_dean': '/college-dean-home',
      'college dean': '/college-dean-home',
      'vice_academy': '/vice-academy-home',
      'vice academy': '/vice-academy-home',
      'human_resours': '/human-resource-home',
      'human resours': '/human-resource-home',
      'student': '/student-home',
      'admin': '/quality-office-home',
      'quality_office': '/quality-office-home'
    };
    
    const normalizedRole = String(role || '').toLowerCase().replace(/\s+/g, '_');
    return roleMap[normalizedRole] || '/profile';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Get user data from Redux state
      const currentUser = user?.data || user;
      const userId = currentUser?._id;
      
      if (!userId) {
        toast.error("User ID not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      const resultAction = await dispatch(
        updateUserPassword({
          userId,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        })
      );

      if (updateUserPassword.fulfilled.match(resultAction)) {
        toast.success("Password updated successfully");
        
        // Clear the form
        setFormData({
          currentPassword: "Osu@1234",
          newPassword: "",
          confirmPassword: "",
        });
        
        // Get user role and redirect to appropriate dashboard
        const userRole = currentUser?.role;
        const dashboardPath = getDashboardPath(userRole);
        
        // Small delay to ensure state updates before navigation
        setTimeout(() => {
          navigate(dashboardPath, { replace: true });
        }, 500);
        
      } else if (updateUserPassword.rejected.match(resultAction)) {
        const error = resultAction.payload || "Failed to update password";
        toast.error(error);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  const LogOutHandler = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="flex items-center justify-center min-h-screen  bg-green-200">
      <img
        src={Osu}
        alt="osu"
        className="w-full h-screen opacity-50 relative"
      />
      <button
        onClick={LogOutHandler}
        className="text-left px-4 py-2 absolute top-1 right-1.5 cursor-pointer bg-(--six) text-white text-sm hover:bg-(--five) flex items-center"
      >
        <FiLogOut className="mr-2" />
        Sign out
      </button>
      <Card className="w-full max-w-md bg-(--six) opacity-100 text-center absolute">
        <CardHeader>
          <CardTitle className="text-white text-2xl">
            Update your account password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center text-[17px] space-x-2">
              <User className="h-4 bg-white w-4" />
              <span className="text-white">
                Username: {user?.username || user?.data?.username}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-white">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="pl-9"
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="pl-9"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="pl-9"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-(--two) text-black cursor-pointer hover:bg-(--two)"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;
