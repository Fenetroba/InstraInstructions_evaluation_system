import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvaluationById, submitEvaluationResponse } from '@/Store/EvaluationSlice';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, CheckCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import logo from "../../assets/logo_2.png";

const Peer_Evaluation_form = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { evaluation, status, submissionStatus } = useSelector((state) => state.evaluations);
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.usersData );
 
  
  const [responses, setResponses] = useState({});
  const [overallComment, setOverallComment] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState('');

  // Filter to get only instructor users
  const instructors = users.filter(u => u.role === 'instructor' && u._id !== user._id);
      {console.log(instructors)}
  // Fetch evaluation data when component mounts
  useEffect(() => {
    if (id) {
      dispatch(fetchEvaluationById(id));
    }
  }, [id, dispatch]);

  // Initialize responses when evaluation data is loaded
  useEffect(() => {
    if (evaluation?.criteria) {
      const initialResponses = {};
      evaluation.criteria.forEach(criterion => {
        initialResponses[criterion._id] = {
          criteriaId: criterion._id,
          rating: 0,
          comments: ''
        };
      });
      setResponses(initialResponses);
    }
  }, [evaluation]);

     const totalScore =
    evaluation?.criteria?.reduce((sum, criterion) => {
      const response = responses[criterion._id];
      const score = response?.rating || 0;
      return sum + score;
    }, 0) || 0;

  const handleResponseChange = (criteriaId, value) => {
    setResponses(prev => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        rating: parseInt(value, 10) || 0
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedInstructor) {
      toast.error('Please select an instructor to evaluate');
      return;
    }

    // Validate all criteria have been rated
    const allRated = Object.values(responses).every(
      response => response.rating > 0
    );
    
    if (!allRated) {
      toast.error('Please rate all criteria before submitting');
      return;
    }

    try {
      await dispatch(submitEvaluationResponse({
        id,
        responses: Object.values(responses),
        overallComment,
        evaluatorId: user._id,
        instructorId: selectedInstructor,
        evaluationType: 'peer'
      })).unwrap();
      
      toast.success('Peer evaluation submitted successfully!');
      navigate('/instructor-home');
    } catch (error) {
     
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading peer evaluation form...</span>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Evaluation not found or you don't have permission to view it.</p>
        <Button 
          onClick={() => navigate(-1)} 
          variant="outline" 
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container bg-(--six) my-10 mx-auto px-4 py-8 max-w-7xl">
      <div className='flex justify-between items-center mb-8'>
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="bg-(--two) hover:bg-(--three) hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
                <span className='text-(--one)  p-2 border-1 border-(--two) rounded-md text-[16px] font-light'>You Have {evaluation.criteria.length} Criteria</span>

      </div>

      <Card className="mb-8">
        <CardHeader className="bg-(--four) text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold flex items-center">
            <img src={logo} alt="logo" className="w-30 mr-4" />
            <p>{evaluation.title} - Peer Evaluation</p>
          </CardTitle>
          <p className="text-blue-100 text-center w-full">
            Please evaluate your peer's performance for this evaluation period.
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="mb-6">
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Instructor to Evaluate
                </Label>
                <select
                  value={selectedInstructor}
                  onChange={(e) => setSelectedInstructor(e.target.value)}
                  className="block text-[17px] w-full md:w-1/3 px-3 bg-(--six) text-(--one) py-2 border border-green-300 rounded-md shadow-sm "
                  required
                >
                  <option value="">Select an instructor</option>
                  {instructors.map((instructor) => (
                       <option key={instructor._id} value={instructor._id} >
                      {instructor.fullName }
                    </option>
                  ))}
            
                </select>
              </div>

              {evaluation.criteria?.map((criterion, index) => (
                <div key={criterion._id} className="space-y-4 border-b pb-6 last:border-b-0">
                  <div>
                    <h3 className="text-lg font-medium flex">
                      <p>{index + 1}.</p> <p>{criterion.category}</p>
                    </h3>
                 <div className='flex justify-between'>
                       <p className="text-sm text-gray-400 mt-1 w-[60%]">
                      {criterion.description}
                    </p>
                    <div className="mt-2 text-sm text-gray-500 bg-(--two) p-2 rounded-md">
                      Weight: {criterion.weight}%
                    </div>
                 </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="block text-sm font-medium text-gray-700">
                      Your Rating (0-{criterion.weight})
                    </Label>
                    <input
                      type="number"
                      min="0"
                      max={criterion.weight}
                      value={responses[criterion._id]?.rating || ''}
                      onChange={(e) => handleResponseChange(criterion._id, e.target.value)}
                      className="w-20 px-3 py-1 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
              ))}

              <div className="space-y-2">
                <Label className="block text-sm font-medium text-gray-700">
                  Overall Comments
                </Label>
                <textarea
                  value={overallComment}
                  onChange={(e) => setOverallComment(e.target.value)}
                  className="w-full px-3 py-3 text-[18px] border border-gray-300 rounded-md"
                  rows="4"
                  placeholder="Provide any additional comments about this evaluation..."
                />
              </div>
            </div>

            <div className="flex justify-between pt-6">
               <div className='bg-(--six) text-(--one) w-[70%] rounded-lg px-10 p-1 text-[19px]'>TOTAL SCORE:   {totalScore} /{" "}
              {evaluation?.criteria?.reduce((sum, c) => sum + c.weight, 0) || 0}</div>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 cursor-pointer "
                disabled={submissionStatus === 'submitting'}
              >
                {submissionStatus === 'submitting' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Submit Evaluation
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Peer_Evaluation_form;