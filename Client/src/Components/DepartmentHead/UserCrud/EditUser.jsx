import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, updateUser } from '../../../Store/UsersDataSlice';

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { users, isLoading, error } = useSelector((state) => state.usersData);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    role: '',
    groupId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Get unique groups and roles for dropdowns
  const groups = [...new Set(users?.map(user => user.groupId).filter(Boolean))];
  const roles = ['Human_resours', 'instructor', 'Student','Vice academy','quality officer','college dean'];

  // Load user data when component mounts or userId changes
  useEffect(() => {
    if (!users || users.length === 0) {
      dispatch(fetchAllUsers());
    } else if (userId) {
      const userToEdit = users.find(user => user._id === userId);
      if (userToEdit) {
        setFormData({
          fullName: userToEdit.fullName || '',
          username: userToEdit.username || '',
          email: userToEdit.email || '',
          role: userToEdit.role || '',
          groupId: userToEdit.groupId || ''
        });
      }
    }
  }, [dispatch, userId, users]);

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
    // Clear error when user starts typing
  

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    const response = await dispatch(updateUser({ userId, userData: formData })).unwrap();
    
    // Handle success
    setSuccessMessage('User updated successfully!');
    setTimeout(() => {
      navigate(-1); // Go back to previous page
    }, 1500);
  } catch (error) {
    if (error.includes('duplicate key error') || error.includes('username')) {
      setFormErrors({
        username: 'This username is already taken'
      });
    } else {
      console.error('Failed to update user:', error);
      setFormErrors({
        submit: error.message || 'Failed to update user. Please try again.'
      });
    }
  } finally {
    setIsSubmitting(false);
  }
};

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mt-20 mx-auto p-6 bg-(--five) rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Edit User</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm text-gray-100 hover:text-gray-800"
        >
          ← Back to Users
        </button>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {formErrors.submit && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {formErrors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-100">
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md p-2 border-gray-100 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              formErrors.fullName ? 'border-red-500' : ''
            }`}
          />
          {formErrors.fullName && (
            <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
          )}
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-100">
            Username *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`mt-1 block w-full p-2 rounded-md bg-white border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              formErrors.username ? 'border-red-500' : ''
            }`}
          />
          {formErrors.username && (
            <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-100">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full p-2 rounded-md bg-white border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              formErrors.email ? 'border-red-500' : ''
            }`}
          />
          {formErrors.email && (
            <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-100">
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`mt-1 block w-full p-2 rounded-md bg-white border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                formErrors.role ? 'border-red-500' : ''
              }`}
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
            {formErrors.role && (
              <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-(--six) cursor-pointer hover:bg-(--three) ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;