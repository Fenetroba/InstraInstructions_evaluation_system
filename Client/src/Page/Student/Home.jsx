import React, { useState } from 'react';
import Header from '@/Components/Student/Header';
import Sider from '@/Components/Student/Sider';
import InstructorList from '@/Components/Student/InstructorList';
import InstructorEvaluations from '@/Components/Student/InstructorEvaluations';

const StudentHome = ({ user }) => {
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const handleSelectInstructor = (instructor) => {
    setSelectedInstructor(instructor);
  };

  const handleBack = () => {
    setSelectedInstructor(null);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header user={user} />
      <div className='flex'>
        <Sider />
        <main className='flex-1 p-6'>
          <div className='max-w-7xl mx-auto'>
            <div className='mb-6 bg-(--two) p-10 rounded-2xl'>
              <h1 className='text-2xl font-bold bg-(--six) p-10  m-10 text-gray-100 rounded-2xl'>
                Hello,👋 {user?.fullName || 'Student'}
              </h1>
              <p className='text-gray-600'>
                {selectedInstructor 
                  ? `Viewing Evaluations For ${selectedInstructor.fullName}` 
                  : ' View Available Evaluations'}
              </p>
            </div>

            {!selectedInstructor ? (
              <InstructorList 
                user={user} 
                onSelectInstructor={handleSelectInstructor} 
              />
            ) : (
              <InstructorEvaluations 
                instructor={selectedInstructor} 
                onBack={handleBack} 
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentHome;