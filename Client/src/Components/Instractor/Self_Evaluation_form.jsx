import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvaluationById, submitEvaluationResponse } from '@/Store/EvaluationSlice';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, ArrowLeft, CheckCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import logo from "../../assets/logo_2.png";
import { fetchAllUsers } from '@/Store/UsersDataSlice';

const ratingOptions = [5, 4, 3, 2, 1];

const InstructorEvaluationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { evaluation, status, submissionStatus } = useSelector((state) => state.evaluations);
  console.log(status)
  const { user } = useSelector((state) => state.auth);
  const { users = [], loading: usersLoading } = useSelector((state) => state.usersData || {});
  
  const [responses, setResponses] = useState({});
  const [overallComment, setOverallComment] = useState('');
  const [courseCode, setCourseCode] = useState('');

  // Fetch evaluation data and users when component mounts
  useEffect(() => {
    if (id) {
      dispatch(fetchEvaluationById(id));
    }
    dispatch(fetchAllUsers());
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
    // Ensure value is a number and within valid range
    let numericValue = parseInt(value) || 0;
    console.log((numericValue = +value));
    setResponses((prev) => ({
      ...prev,
      [criteriaId]: {
        criteriaId: criteriaId,
        rating: numericValue,
        comments: prev[criteriaId]?.comments || "",
      },
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
        courseCode,
        evaluatorId: user._id,
        instructorId: user._id // Self-evaluation: evaluator and instructor are the same
      })).unwrap();
      
      toast.success('Evaluation submitted successfully!');
      navigate('/instructor-home');
    } catch (error) {
      // toast.error(error.message || 'Failed to submit evaluation');
    }
  };

  if (status === 'loading' || usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading evaluation form...</span>
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
    <div className="container  bg-(--six) my-10 mx-auto px-4 py-8 max-w-7xl">
   <div className='flex justify-between  items-center'>
        <Button 
        onClick={() => navigate(-1)} 
        variant="ghost" 
        className="mb-6 bg-(--two)"
      >
        <ArrowLeft className="h-4 w-4 mr-2  " />
        Back to Dashboard
      </Button>
        <span className='text-(--one)  p-2 border-1 border-(--two) rounded-md text-[16px] font-light'>You Have {evaluation.criteria.length} Criteria</span>
   </div>

      <Card className="mb-8">
        <CardHeader className="bg-(--four) text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold flex items-center">
            <img src={logo} alt="logo" className="w-30 mr-4" />
            <p>{evaluation.title} - Self Evaluation</p>
          </CardTitle>
          <p className="text-blue-100 text-center w-full">
            Please evaluate your own performance for this evaluation period.
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {console.log(evaluation.criteria.length)}
            {evaluation.criteria?.map((criterion, index) => (
              <div key={criterion._id} className="space-y-4 border-b pb-6 last:border-b-0">
                <div>
                  {console.log(criterion)}
                  <h3 className="text-lg font-medium">
                    <span>{index+1}</span>.<span className="text-(--six)">{criterion.category}</span>
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 flex justify-between">
                 <span>   {criterion.description}</span>
                    <span className="text-(--six) bg-(--two) p-1 rounded-md">{criterion.weight}%</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 items-center">
                 {/* <input type="number" placeholder={`0-${criterion.weight}`} max={criterion.weight} min={0} className=' text-[19px] border-1 border-(--six)  rounded-md py-1 px-4' /> */}


                  <input
                    type="number"
                    max={criterion.weight}
                    min={0}
                    step="1"
                    className="my-2 p-1 text-[23px] shadow-lg rounded-lg w-30 bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={responses[criterion._id]?.rating ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        value === "" ||
                        (parseInt(value) >= 0 &&
                          parseInt(value) <= criterion.weight)
                      ) {
                        handleResponseChange(criterion._id, value);
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure the value is within bounds when input loses focus
                      const value = parseInt(e.target.value) || 0;
                      const boundedValue = Math.min(
                        Math.max(value, 0),
                        criterion.weight
                      );
                      if (value !== boundedValue) {
                        handleResponseChange(criterion._id, boundedValue);
                      }
                    }}
                    placeholder={`0-${criterion.weight}`}
                    required
                  />
                 <span className='text-[17px]'>%</span>
                  </div>
                </div>

              </div>
            ))}
            <div className="flex justify-between pt-6">
               <div className='bg-(--six) text-(--one) w-[70%] rounded-lg px-10 p-1 text-[19px]'>TOTAL SCORE:   {totalScore} /{" "}
              {evaluation?.criteria?.reduce((sum, c) => sum + c.weight, 0) || 0}</div>
              <Button
                type="submit"
             
                className="bg-green-600 hover:bg-green-700 cursor-pointer"
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

export default InstructorEvaluationForm;