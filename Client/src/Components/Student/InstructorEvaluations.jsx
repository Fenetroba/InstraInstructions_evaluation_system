import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllEvaluations } from '@/Store/EvaluationSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, FileText, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

const InstructorEvaluations = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { evaluations, status, error } = useSelector((state) => ({
    evaluations: Array.isArray(state.evaluations.evaluations?.docs) 
      ? state.evaluations.evaluations.docs 
      : [],
    status: state.evaluations.status,
    error: state.evaluations.error
  }));

  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showCriteria, setShowCriteria] = useState(false);

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
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
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
                        <span className="text-sm font-medium">Weight: {criterion.weight}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No criteria available for this evaluation.</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t pt-4">
            <Button 
              onClick={() => handleStartEvaluation(selectedEvaluation._id)}
              className="w-full sm:w-auto"
            >
              Proceed to Evaluation
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