import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { register, clearError } from '@/Store/AuthUserSlice';

const CreateUser = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const { loading, error: authError } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: 'Osu@1234',
    role: '',
    department: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const departments = [
    'Computer Science',
    'Information Technology',
    'Accounting and Finance',
    'Economics',
    'LAW',
    'Management'
  ];

  const roles = [
    { value: 'instructor', label: 'Instructor' },
    { value: 'department_head', label: 'Department Head' },
    { value: 'quality_officer', label: 'Quality Officer'},
    { value: 'Student', label: 'Student' },
    { value: 'college_dean', label: 'College Dean' },
    { value: 'Human_resours', label: 'Human Resours' },
    { value: 'Vice_academy', label: 'Vice Academy' },
    
  ];

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    try {
      const resultAction = await dispatch(register(formData));

      if (register.fulfilled.match(resultAction)) {
        toast.success('User created successfully!');
        // Reset form
        setFormData({
          fullName: '',
          username: '',
          email: '',
          password: '',
          role: '',
          department: ''
        });
        setFormErrors({});
        
        // Call onSuccess callback if provided (e.g., to close a modal or redirect)
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      // This will be handled by the rejected case in the slice
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New User</h2>
      

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter full name"
              value={formData.fullName}
              onChange={handleChange}
              className={formErrors.fullName ? 'border-red-500' : ''}
            />
            {formErrors.fullName && (
              <p className="text-sm text-red-500">{formErrors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              className={formErrors.username ? 'border-red-500' : ''}
            />
            {formErrors.username && (
              <p className="text-sm text-red-500">{formErrors.username}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            className={formErrors.email ? 'border-red-500' : ''}
          />
          {formErrors.email && (
            <p className="text-sm text-red-500">{formErrors.email}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password (Password)</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              className={formErrors.password ? 'border-red-500' : ''}
            />
            {formErrors.password && (
              <p className="text-sm text-red-500">{formErrors.password}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleSelectChange('role', value)}
            >
              <SelectTrigger className={formErrors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.role && (
              <p className="text-sm text-red-500">{formErrors.role}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => handleSelectChange('department', value)}
            >
              <SelectTrigger className={formErrors.department ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.department && (
              <p className="text-sm text-red-500">{formErrors.department}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                fullName: '',
                username: '',
                email: '',
                password: '',
                role: 'instructor',
                department: ''
              });
              setFormErrors({});
            }}
            disabled={loading}
          >
            Reset
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;