import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { fetchAllEvaluations, submitEvaluationResponse } from '@/Store/EvaluationSlice';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, FileText, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const InstructorEvaluations = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // Create memoized selector
  const selectEvaluationsData = useMemo(
    () => createSelector(
      [(state) => state.evaluations],
      (evaluationsState) => ({
        evaluations: Array.isArray(evaluationsState.evaluations?.docs) 
          ? evaluationsState.evaluations.docs 
          : [],
        status: evaluationsState.status,
        error: evaluationsState.error
      })
    ),
    [] // No dependencies since we're only accessing state
  );

  const { evaluations, status, error } = useSelector(selectEvaluationsData);
  console.log(evaluations)

  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showCriteria, setShowCriteria] = useState(false);
  const [scores, setScores] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});


  // Fetch all evaluations on component mount
  useEffect(() => {
    dispatch(fetchAllEvaluations());
  }, [dispatch]);

  // Filter out evaluations the student has already completed
  const availableEvaluations = evaluations.filter(evaluation => {
    if (!evaluation.responses || evaluation.responses.length === 0) return true;
    return !evaluation.responses.some(
      response => response.student?.toString() === user?._id
    );
  });

  // Handle evaluation selection
  const handleSelectEvaluation = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowCriteria(true);
  };

  // Handle score change
  const handleScoreChange = (criterion, value) => {
    const criterionId = criterion._id || criterion.id;
    const numValue = parseFloat(value) || 0;
    setScores(prev => ({
      ...prev,
      [criterionId]: numValue
    }));
    console.log(criterionId)
    // Clear error for this field if it exists
    if (formErrors[criterionId]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[criterionId];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    if (selectedEvaluation?.criteria) {
      selectedEvaluation.criteria.forEach(criterion => {
        const criterionId = criterion._id || criterion.id;
        const score = scores[criterionId] || 0;
        if (isNaN(score) || score < 0 || score > criterion.weight) {
          errors[criterionId] = `Score must be between 0 and ${criterion.weight}`;
          isValid = false;
        }
      });
    }
    
    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmitEvaluation = async () => {
    if (!validateForm()) {
      toast.error('Please correct the errors before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare answers in the format expected by the API
      const answers = {};
      selectedEvaluation.criteria.forEach(criterion => {
        const criterionId = criterion._id || criterion.id;
        answers[criterionId] = scores[criterionId] || 0;
      });

      // Log the payload for debugging
      console.log('Submitting evaluation with data:', {
        evaluationId: selectedEvaluation._id,
        answers
      });

      const response = await dispatch(submitEvaluationResponse({
        evaluationId: selectedEvaluation._id,
        answers
      })).unwrap();
      
      toast.success('Evaluation submitted successfully!');
      
      // Refresh evaluations and reset form
      await dispatch(fetchAllEvaluations());
      setScores({});
      setFormErrors({});
      setShowCriteria(false);
      
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      
      // More detailed error handling
      let errorMessage = error.message || 'Failed to submit evaluation';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle start evaluation
  const handleStartEvaluation = (evaluationId) => {
    navigate(`/evaluate/${evaluationId}`);
  };

  // Format date range
  const formatDateRange = (startDate, endDate) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
    } catch (error) {
      console.error('Error formatting dates:', error);
      return 'Invalid date range';
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading evaluations...</span>
      </div>
    );
  }

  // Error state
  if (status === 'failed') {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || 'Failed to load evaluations. Please try again.'}
          </AlertDescription>
          <Button 
            variant="outline" 
            onClick={() => dispatch(fetchAllEvaluations())}
            className="mt-2"
          >
            <Loader2 className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  // No evaluations available
  if (availableEvaluations.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">No Evaluations Available</h3>
        <p className="text-muted-foreground mb-6">
          {evaluations.length === 0 
            ? 'There are no evaluations available at the moment.' 
            : 'You have completed all available evaluations.'}
        </p>
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  // Show criteria view
  if (showCriteria && selectedEvaluation) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <Button 
          variant="ghost" 
          onClick={() => setShowCriteria(false)}
          className="mb-6"
        >
          <ChevronRight className="h-4 w-4 mr-2 transform rotate-180" />
          Back to Evaluations
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{selectedEvaluation.title}</CardTitle>
            <CardDescription>{selectedEvaluation.description || 'No description available.'}</CardDescription>
            <div className="text-sm text-muted-foreground mt-2">
              {formatDateRange(selectedEvaluation.startDate, selectedEvaluation.endDate)}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Evaluation Criteria</h3>
              {selectedEvaluation.criteria?.length > 0 ? (
                <div className="space-y-4">
                  {selectedEvaluation.criteria.map((criterion, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{criterion.category}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{criterion.description}</p>
                        </div>
                        <div className='flex flex-col space-y-2 w-48'>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Score (0-{criterion.weight})</span>
                            <span className="text-sm text-muted-foreground">Max: {criterion.weight}%</span>
                          </div>
                          <input 
                            type="number" 
                            value={scores[criterion._id || criterion.id] || ''}
                            onChange={(e) => handleScoreChange(criterion, e.target.value)}
                            className={`w-full p-2 border rounded-md ${
                              formErrors[criterion._id || criterion.id] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            min={0}
                            max={criterion.weight}
                            step="0.5"
                            placeholder="0"
                          />
                          {formErrors[criterion._id || criterion.id] && (
                            <p className="text-xs text-red-500">{formErrors[criterion._id || criterion.id]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No criteria available for this evaluation.</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 border-t pt-4">
            <Button 
              variant="outline"
              onClick={() => setShowCriteria(false)}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitEvaluation}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : 'Submit Evaluation'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Main evaluations list view
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Available Evaluations</h1>
      
      <div className="grid gap-4 md:grid-cols-2">
        {availableEvaluations.map((evaluation) => (
          <Card key={evaluation._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                {evaluation.title}
              </CardTitle>
              <CardDescription>
                {evaluation.description || 'No description available.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p>{formatDateRange(evaluation.startDate, evaluation.endDate)}</p>
                  <p>{evaluation.criteria?.length || 0} criteria</p>
                </div>
                <Button 
                  onClick={() => handleSelectEvaluation(evaluation)}
                  className="w-full"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InstructorEvaluations;