import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers } from '../../Store/UsersDataSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InstructorList = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get users from Redux store
  const { users, loading, error } = useSelector((state) => state.usersData);

  useEffect(() => {
    // Only fetch users if we don't have them yet
    if (users.length === 0) {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, users.length]);

  // Filter instructors from the same department as the student
  const departmentInstructors = users.filter(
    (u) => 
      u.role === 'instructor' && 
      u.department === user?.data?.department
  ) || [];

  // Handle instructor selection
  const handleSelectInstructor = (instructor) => {
    navigate(`/instructors/${instructor._id}/evaluations`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4 flex items-center justify-center"><Users/><span className='ml-2'>Instructors in Your Department</span></h2>
      {departmentInstructors.length === 0 ? (
        <p>No instructors found in your department.</p>
      ) : (
        <div className="grid mb-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentInstructors.map((instructor) => (
            <Card key={instructor._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-[17px]">{instructor.fullName || 'Instructor'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-[17px] mb-4">
                  {instructor.email || 'No email available'}
                </p>
                <Button 
                  onClick={() => handleSelectInstructor(instructor)}
                  className="w-full bg-(--six) cursor-pointer hover:bg-blue-600 transition-colors"
                >
                  View Evaluation Forms
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorList;
