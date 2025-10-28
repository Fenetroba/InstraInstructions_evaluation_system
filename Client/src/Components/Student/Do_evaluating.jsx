import  { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // Make sure useSelector is imported
import { fetchEvaluationById, submitEvaluationResponse } from '@/Store/EvaluationSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Do_evaluating = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { evaluations: selectedEvaluation, status, error } = useSelector((state) => state.evaluations);
  console.log(selectedEvaluation)
  const { user: currentUser } = useSelector((state) => state.auth);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchEvaluationById(id));
    }
  }, [dispatch, id]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation: ensure all required questions are answered
    const requiredQuestions = selectedEvaluation?.questions?.filter(q => q.required) || [];
    const unanswered = requiredQuestions.filter(q => !answers[q._id]);

    if (unanswered.length > 0) {
      toast.error(`Please answer all required questions. Unanswered: ${unanswered.map(q => `"${q.questionText}"`).join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    const responseData = {
      evaluationId: id,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
        // You might calculate a score here if applicable, or on the backend
        score: typeof answer === 'number' ? answer : undefined,
      })),
    };

    try {
      await dispatch(submitEvaluationResponse(responseData)).unwrap();
      toast.success('Evaluation submitted successfully!');
      navigate('/student-home'); // Or to a "thank you" page
    } catch (err) {
      toast.error(err.message || 'Failed to submit evaluation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading Evaluation...</span>
      </div>
    );
  }

  if (status === 'failed') {
    return <div className="text-center py-10 text-red-500">Error: {error || 'Failed to load evaluation.'}</div>;
  }

  if (!selectedEvaluation) {
    return <div className="text-center py-10">Evaluation not found.</div>;
  }

  const isEvaluationActive = selectedEvaluation.status === 'draft';
  {console.log(isEvaluationActive)}
  const now = new Date();
  const isWithinDateRange = new Date(selectedEvaluation.startDate) <= now && now <= new Date(selectedEvaluation.endDate);
  const canSubmit = isEvaluationActive && isWithinDateRange;

  const alreadySubmitted = currentUser && selectedEvaluation.responses?.some(
    response => response.student === currentUser._id
  );

  const submissionDisabled = isSubmitting || !canSubmit || alreadySubmitted;
  let submissionMessage = 'Submit Evaluation';
  if (isSubmitting) submissionMessage = 'Submitting...';
  if (alreadySubmitted) submissionMessage = 'Already Submitted';
  if (!canSubmit && !alreadySubmitted) submissionMessage = 'Evaluation Not Active';

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">{selectedEvaluation.title}</CardTitle>
          <CardDescription>
            Instructor: {selectedEvaluation.instructor?.fullName || 'N/A'} | Course: {selectedEvaluation.courseCode || 'N/A'}
          </CardDescription>
        </CardHeader>
        {!canSubmit && !alreadySubmitted && (
            <div className="px-6 pb-4">
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                <p className="font-bold">Evaluation Not Active</p>
                <p>
                  This evaluation is not currently accepting responses. It is available from {new Date(selectedEvaluation.startDate).toLocaleDateString()} to {new Date(selectedEvaluation.endDate).toLocaleDateString()}.
                </p>
              </div>
            </div>
        )}
        {alreadySubmitted && (
            <div className="px-6 pb-4">
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
                <p className="font-bold">Response Submitted</p>
                <p>You have already completed this evaluation. Thank you for your feedback!</p>
              </div>
            </div>
        )}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {selectedEvaluation.questions?.map((question, index) => (
              <div key={question._id} className="p-4 border rounded-lg">
                <Label className="font-semibold text-lg">
                  {index + 1}. {question.questionText}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <div className="mt-4">
                  {question.questionType === 'scale' && (
                    <RadioGroup
                      disabled={submissionDisabled}
                      onValueChange={(value) => handleAnswerChange(question._id, parseInt(value))}
                      className="flex flex-wrap gap-4"
                    >
                      {[1, 2, 3, 4, 5].map(val => (
                        <div key={val} className="flex items-center space-x-2">
                          <RadioGroupItem value={val.toString()} id={`${question._id}-${val}`} />
                          <Label htmlFor={`${question._id}-${val}`}>{val}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  {question.questionType === 'multiple_choice' && (
                     <RadioGroup
                      disabled={submissionDisabled}
                      onValueChange={(value) => handleAnswerChange(question._id, value)}
                    >
                      {question.options.map((opt, i) => (
                         <div key={i} className="flex items-center space-x-2">
                           <RadioGroupItem value={opt.text} id={`${question._id}-${i}`} />
                           <Label htmlFor={`${question._id}-${i}`}>{opt.text}</Label>
                         </div>
                      ))}
                    </RadioGroup>
                  )}
                  {question.questionType === 'text' && (
                    <Textarea
                      disabled={submissionDisabled}
                      placeholder="Your feedback..."
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                    />
                  )}
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <Button type="submit" disabled={submissionDisabled}>
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  submissionMessage
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Do_evaluating;