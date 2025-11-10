import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers } from '../../Store/UsersDataSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpenCheckIcon, Loader2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchEvaluations } from '@/Store/EvaluationSlice';

const InstructorList = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get users from Redux store
  const { users, loading, error } = useSelector((state) => state.usersData);
const { evaluations } = useSelector((state) => state.evaluations);
useEffect(()=>{
dispatch(fetchEvaluations())
},[dispatch])
console.log(evaluations)
  useEffect(() => {
    // Only fetch users if we don't have them yet
    if (users.length === 0) {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, users.length]);

  // Filter instructors from the same department as the student
  const departmentEvaluation = evaluations.filter(
    (evaluation) => 
      evaluation.criteria
  ) || [];

 console.log(departmentEvaluation)
  // Handle instructor selection
  const handleSelectInstructor = (evaluation) => {
    navigate(`/evaluation/${evaluation._id}`);
  };
 if(departmentEvaluation.status!=='active'){
  
 }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4 flex items-center justify-center"><Users/><span className='ml-2'>Instructors Evaluation in Your Department</span></h2>
      {(departmentEvaluation.length === 0) ? (
        <p className='text-center w-full mt-20'>NO EVALUATION <BookOpenCheckIcon/> </p>
      ) : (
        <div className="bg-green-900 p-3">
          {departmentEvaluation.map((evaluation) => (
            evaluation.category === "Student" ? (
            <Card key={evaluation._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-[17px]">{evaluation.title || 'Instructor'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-[17px] mb-4">
                  {evaluation.description || 'No email available'}
                </p>
                {evaluation.status!=='active' ? (
                  <p className="bg-yellow-500 p-2 text-[17px] mb-4">Evaluation is not active</p>
                ) : (
                <Button 
                  onClick={() => handleSelectInstructor(evaluation)}
                  className="w-full bg-(--six) cursor-pointer hover:bg-green-700 transition-colors"
                >
                  View Evaluation Forms
                </Button>
                )}
              </CardContent>
            </Card>
            ) : null
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorList;
