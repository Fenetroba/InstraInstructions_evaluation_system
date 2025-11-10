import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Key, Eye, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserPassword } from '@/Store/UsersDataSlice';

const Security = () => {
  const {user}=useSelector(state=>state.auth)
  console.log(user._id)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const dispatch=useDispatch()
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await dispatch(updateUserPassword({
        userId: user._id,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })).unwrap();
      
      toast.success('Password updated successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.log(error )
      toast.error(error || 'Failed to update passwordd');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w mx-auto p-16 bg-white rounded-lg shadow-sm">
      
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              name="currentPassword"
              type={showPassword.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={handleChange}
              className={`pr-10 ${errors.currentPassword ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              name="newPassword"
              type={showPassword.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange}
              className={`pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.newPassword ? (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters long
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-600 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : (
              'Update Password'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Security;