import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaBook, FaChartLine, FaCog } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { profile } from '@/Store/AuthUserSlice';
import { toast } from 'sonner';

const Profile = ({user}) => {
  const [activeTab, setActiveTab] = useState('about');
  const dispatch = useDispatch();
  const {loading, error } = useSelector((state) => state.auth);
const Users=user?.data
  // Format user data with default values to prevent undefined errors
  const userData = {
    name: Users?.fullName || 'No Name',
    email: Users?.email || 'No Email',
    role: Users?.role ? Users.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'User',
    avatar: Users?.fullName.charAt(0) || 'User',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">Error loading profile</p>
          <p className="mt-2">{error}</p>
          <button 
            onClick={() => dispatch(profile())}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-(--five) rounded-lg shadow overflow-hidden">
          <div className="px-6 py-8 sm:flex sm:items-center sm:space-x-6">
            <div className="flex-shrink-0">
              <img
                className="h-24 w-24 rounded-full bg-(--six) text-(--two) font-bold object-cover border-4 border-white shadow-sm"
                src={userData.avatar}
                alt={userData.name.charAt(0).toUpperCase()}
              />
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">{userData.name}</h1>
                <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {userData.role}
                </span>
                <button 
                  className="ml-4 p-1 text-gray-400 hover:text-gray-500"
                  onClick={() => setActiveTab('settings')}
                >
                  <FaEdit className="h-5 w-5" />
                </button>
              </div>
         
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center text-sm text-gray-500">
                  <FaEnvelope className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {userData.email}
                </div>
             
              </div>
            </div>
          </div>
        
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('about')}
                className={`${activeTab === 'about' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <FaUser className="inline mr-2" /> About
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`${activeTab === 'courses' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <FaBook className="inline mr-2" /> Courses
              </button>
             
              <button
                onClick={() => setActiveTab('settings')}
                className={`${activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <FaCog className="inline mr-2" /> Settings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'about' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">About Me</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and information.</p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                  <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Full name</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData.name}</dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Email address</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData.email}</dd>
                    </div>
                  
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Role</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {userData.role}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">About</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {userData.bio}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">My Courses</h3>
                <p className="mt-1 text-sm text-gray-500">Manage and view your courses here.</p>
                <div className="mt-4 text-center text-gray-500">
                  <p>No courses available yet.</p>
                </div>
              </div>
            )}

          
            {activeTab === 'settings' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
                <p className="mt-1 text-sm text-gray-500">Update your account information and settings.</p>
                <div className="mt-6 space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      defaultValue={userData.name}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      defaultValue={userData.email}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      disabled
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-(--six) cursor-pointer hover:bg-(--four)"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;