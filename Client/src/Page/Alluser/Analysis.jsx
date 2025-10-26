import React, { useEffect } from 'react';
import { Users, ClipboardCheck, FileText, TrendingUp, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers } from '@/Store/UsersDataSlice';

const Analysis = () => {
  const {users}=useSelector(state=>state.usersData)
  const dispatch=useDispatch()
  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);
  const instructors = users.filter(user => user.role === "instructor");
  const students = users.filter(user => user.role === "Student");
  console.log(instructors.length)
  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Instructors</p>
              <p className="text-3xl font-bold text-gray-900">{instructors.length}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Evaluations</p>
              <p className="text-3xl font-bold text-gray-900">1</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <ClipboardCheck className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900">67</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{students.length}</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <User className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {/* <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Overview</h2>
        <p className="text-gray-600">
          Welcome to the Instructor Evaluation System Dashboard. Here you can view
          comprehensive analytics and insights about evaluation data.
        </p>
      </div> */}
    </div>
  );
};

export default Analysis;
