import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvaluationById, submitEvaluationResponse } from '@/Store/EvaluationSlice';
import { Loader2, AlertCircle, FileText, ArrowLeft, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

const InstructorEvaluations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const { evaluation, status, error } = useSelector((state) => state.evaluations);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch evaluation when component mounts or ID changes
  useEffect(() => {
    if (id) {
      dispatch(fetchEvaluationById(id));
    }
  }, [id, dispatch]);

  // Handle answer selection
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await dispatch(submitEvaluationResponse({
        evaluationId: id,
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          question: questionId,
          answer
        }))
      })).unwrap();
      
      toast.success('Evaluation submitted successfully!');
      navigate('/student-home');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error || 'Failed to submit evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user has already submitted this evaluation
  const hasSubmitted = evaluation?.responses?.some(r => 
    r.student?._id === user?.data?._id
  );

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading evaluation...</span>
      </div>
    );
  }

  // Error state
  if (status === 'failed' || error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || 'Failed to load evaluation. Please try again.'}
          </AlertDescription>
          <Button 
            variant="outline" 
            onClick={() => dispatch(fetchEvaluationById(id))}
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  // No evaluation found
  if (!evaluation) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Evaluation Not Found</h3>
        <p className="text-muted-foreground mb-6">
          The requested evaluation could not be found.
        </p>
        <Button onClick={() => navigate(-1)}>
          ← Back to List
        </Button>
      </div>
    );
  }

  const { title, description, questions, startDate, endDate } = evaluation;
  const now = new Date();
  const isActive = new Date(startDate) <= now && now <= new Date(endDate);
  const isUpcoming = new Date(startDate) > now;
  const isCompleted = new Date(endDate) < now;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription className="mt-2">
                {description || 'No description provided.'}
              </CardDescription>
            </div>
            <div className="text-sm text-right">
              <div>Start: {format(new Date(startDate), 'PPpp')}</div>
              <div>End: {format(new Date(endDate), 'PPpp')}</div>
              <div className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isUpcoming 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : isCompleted 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
              }`}>
                {isUpcoming ? 'Upcoming' : isCompleted ? 'Completed' : 'In Progress'}
              </div>
            </div>
          </div>
        </CardHeader>

        {hasSubmitted ? (
          <CardContent>
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Evaluation Submitted</h3>
              <p className="text-muted-foreground mb-6">
                Thank you for submitting your evaluation.
              </p>
              <Button onClick={() => navigate('/student-home')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {questions?.map((question, index) => (
                <div key={question._id} className="space-y-2">
                  <h3 className="font-medium">
                    {index + 1}. {question.questionText}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  {question.type === 'text' ? (
                    <textarea
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      required={question.required}
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                    />
                  ) : (
                    <div className="space-y-2">
                      {question.options.map((option, i) => (
                        <div key={i} className="flex items-center">
                          <input
                            type="radio"
                            id={`${question._id}-${i}`}
                            name={question._id}
                            value={option}
                            required={question.required}
                            onChange={() => handleAnswerChange(question._id, option)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <label htmlFor={`${question._id}-${i}`} className="ml-2">
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t">
                <Button 
                  type="submit" 
                  disabled={!isActive || isSubmitting || hasSubmitted}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Evaluation'
                  )}
                </Button>
                {!isActive && (
                  <p className="mt-2 text-sm text-red-500">
                    {isUpcoming 
                      ? 'This evaluation is not yet available.' 
                      : 'This evaluation has ended.'}
                  </p>
                )}
              </div>
            </CardContent>
          </form>
        )}
      </Card>
    </div>
  );
};

export default InstructorEvaluations;