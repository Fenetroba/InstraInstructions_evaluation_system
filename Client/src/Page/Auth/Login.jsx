import { loginUser } from '@/Store/AuthUserSlice';
import React, { useState } from 'react';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
const Login = () => {
  const navigate=useNavigate();
  const dispatch=useDispatch()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

 const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const result = await dispatch(loginUser(formData));

      if (result.meta.requestStatus === 'fulfilled' && result.payload?.success) {
        // Success: Display success message from backend
        toast.success(result.payload.message || 'Login successful!');

        // Clear form
        setFormData({
          username: "",
          password: "",
        });


    
      } else {
        // Error: Display error message from backend
        const errorMessage = result.payload?.message || result.error?.message || 'Login failed';
        toast.error(errorMessage);
      }
    } catch (error) {
      // Unexpected error
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className='min-h-screen flex flex-col md:flex-row '>
      {/* Login Form */}
      <div className='w-full md:w-1/2 flex items-center justify-center p-8'>
        <div className='w-full max-w-md bg-(--six) p-8 rounded-xl shadow-lg'>
  <h1 className=' my-5 text-(--one)'>LOGIN</h1>
          
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-1'>
              <label htmlFor='username' className='block text-sm font-medium text-gray-200'>
                Username
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FaUser className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='text'
                  id='username'
                  name='username'
                  value={formData.username}
                  onChange={handleChange}
                  placeholder='Enter your username'
                  className='block w-full pl-10 pr-3 py-2 font-light  text-[18px] border text-white border-gray-300 rounded-lg '
                  required
                />
              </div>
            </div>
            
            <div className='space-y-1'>
              <div className='flex items-center justify-between'>
                <label htmlFor='password' className='block text-sm font-medium text-gray-200'>
                  Password
                </label>
                <a href='#forgot' className='text-sm text-green-600 hover:text-green-500 hover:underline'>
                  Forgot password?
                </a>
              </div>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FaLock className='h-5 w-5 text-gray-200' />
                </div>
                <input
                  type='password'
                  id='password'
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  placeholder='Enter your password'
                  className='block w-full pl-10 pr-3 font-light py-2 text-[18px] border text-white border-gray-300 rounded-lg '
                
                  required
                />
              </div>
            </div>
            
            
            
            <button
              type='submit'
              className='w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-(--three) hover:bg-(--four) cursor-pointer'
            >
              <FaSignInAlt className='mr-2' />
              Sign In
            </button>
          </form>
        </div>
      </div>
      
      {/* Right Side - Decorative */}
      <div className='hidden md:flex md:w-screen bg-(--six) items-center justify-center p-12'>
        <div className='text-white text-center max-w-md'>
          <h2 className='text-4xl font-bold mb-4'>Oromia State University </h2>
          <p className='text-blue-100 text-lg'>
            Instructor Evaluation System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;