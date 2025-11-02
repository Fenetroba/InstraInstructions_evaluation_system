import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllEvaluations } from '@/Store/EvaluationSlice';
import { Loader2, AlertCircle, FileText, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Helper function to determine evaluation status
const getStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) {
    return { text: 'Upcoming', className: 'bg-yellow-100 text-yellow-800' };
  } else if (now >= start && now <= end) {
    return { text: 'In Progress', className: 'bg-blue-100 text-blue-800' };
  } else {
    return { text: 'Completed', className: 'bg-green-100 text-green-800' };
  }
};

const InstructorEvaluations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Select the evaluations state
  const { evaluations, status, error } = useSelector((state) => state.evaluations);
  
  // Log the evaluations for debugging
  console.log('Evaluations data:', evaluations);
  
  // Safely extract evaluations list and handle different response formats
  const getEvaluationsList = () => {
    if (!evaluations) return [];
    
    // Handle array response
    if (Array.isArray(evaluations)) {
      return evaluations;
    }
    
    // Handle paginated response
    if (evaluations.docs && Array.isArray(evaluations.docs)) {
      return evaluations.docs;
    }
    
    // Handle single evaluation (shouldn't happen, but just in case)
    if (evaluations._id) {
      return [evaluations];
    }
    
    return [];
  };
  
  const evaluationsList = getEvaluationsList();

  // Fetch evaluations when component mounts or instructor changes
  useEffect(() => {
    if (id) {
      dispatch(fetchAllEvaluations({ instructorId: id }));
    }
  }, [dispatch, id]);

  // Handle back navigation
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Loading state
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading evaluations...</p>
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
          <AlertDescription className="mb-4">
            {error || 'Failed to load evaluations. Please try again.'}
          </AlertDescription>
          <Button 
            variant="outline" 
            onClick={() => dispatch(fetchAllEvaluations({ instructorId: id }))}
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  // No evaluations found
  if (evaluationsList.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="p-8 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Evaluations Available</h3>
          <p className="text-muted-foreground mb-6">
            There are currently no evaluation forms available for this instructor.
          </p>
          <div className="space-x-3">
            <Button onClick={handleBack} variant="outline">
              ← Back to Instructors
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => dispatch(fetchAllEvaluations({ instructorId: id }))}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="w-34 hover:bg-gray-100"
        >
          ← Back to Instructors
        </Button>
        <h2 className="text-2xl font-bold">
          Evaluations for Instructor
        </h2>
      </div>

      {evaluationsList.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No evaluation forms available for this instructor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {evaluationsList.map((evaluation) => {
            const status = getStatus(evaluation.startDate, evaluation.endDate);
            const isCompleted = status.text === 'Completed';
            const isUpcoming = status.text === 'Upcoming';
            
            return (
              <Card key={evaluation._id} className="hover:shadow-lg transition-shadow border border-gray-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{evaluation.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {evaluation.courseCode || 'General Evaluation'}
                      </CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.className}`}>
                      {status.text}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Evaluation Period:</p>
                    <p>
                      {format(new Date(evaluation.startDate), 'MMM d, yyyy')} - {format(new Date(evaluation.endDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {evaluation.description || 'No description available'}
                  </p>
                  <Button 
                    variant={isCompleted ? 'outline' : 'default'}
                    disabled={isUpcoming}
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      // Handle evaluation start/view
                      console.log('View/Start evaluation:', evaluation._id);
                    }}
                  >
                    {isCompleted ? 'View Submission' : isUpcoming ? 'Evaluation Not Started' : 'Start Evaluation'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  )
}


export default InstructorEvaluations;
