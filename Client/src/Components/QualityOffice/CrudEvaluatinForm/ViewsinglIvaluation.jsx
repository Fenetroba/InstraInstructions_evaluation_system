import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvaluationById } from '@/Store/EvaluationSlice';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  BookOpen, 
  FileText, 
  Award,
  Loader2,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ViewsinglIvaluation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { evaluation, status, error } = useSelector((state) => state.evaluations);
  console.log(evaluation)
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      dispatch(fetchEvaluationById(id));
    }
  }, [id, dispatch]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      completed: { color: 'bg-blue-100 text-blue-800', icon: Award },
      archived: { color: 'bg-purple-100 text-purple-800', icon: Archive }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${config.color}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStatusInfo = (status) => {
    const statusInfo = {
      draft: 'This evaluation is in draft mode and has not been published yet.',
      active: 'This evaluation is currently active and accepting responses.',
      completed: 'This evaluation has been completed and no longer accepts responses.',
      archived: 'This evaluation has been archived.'
    };
    return statusInfo[status] || '';
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading evaluation details...</span>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-10">
            <p className="text-red-500 mb-4">Error: {error || 'Failed to load evaluation'}</p>
            <Button 
              onClick={() => navigate('/quality-office-home')}
              variant="outline"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No evaluation found</p>
            <Button 
              onClick={() => navigate('/quality-office-home')}
              variant="outline"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-(white) rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b bg-(--two) border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/quality-office-home')}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{evaluation.title}</h1>
                <p className="text-gray-600 text-[15px] mt-1">{evaluation.description ||''}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(evaluation.status)}
            </div>
          </div>
        </div>

        {/* Status Info Bar */}
        <div className="bg-(--six) border-l-4 border-(--two) p-4 mx-6 mt-4 rounded">
          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-(--two) mt-0.5" />
            <div className="text-sm text-(--one) ">
              <p className="font-semibold">Status: {evaluation.status}</p>
              <p className="mt-1">{getStatusInfo(evaluation.status)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 mt-6">
          <div className="flex gap-2">
            {['overview', 'criteria', 'questions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-semibold">Academic Year</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{evaluation.academicYear}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-semibold">Semester</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{evaluation.semester}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-sm font-semibold">Course Code</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {evaluation.courseCode || 'N/A'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-semibold">Instructor</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {evaluation.instructor?.fullName || 'N/A'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-semibold">Start Date</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(evaluation.startDate)}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-semibold">End Date</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(evaluation.endDate)}
                  </p>
                </div>
              </div>

              {/* Statistics */}
              {evaluation.responseCount > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-semibold">Responses</p>
                        <p className="text-2xl font-bold text-blue-900">{evaluation.responseCount}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>

                  {evaluation.averageScore && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 font-semibold">Average Score</p>
                          <p className="text-2xl font-bold text-green-900">
                            {evaluation.averageScore.toFixed(2)}
                          </p>
                        </div>
                        <Award className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                  )}

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-semibold">Total Questions</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {evaluation.questions?.length || 0}
                        </p>
                      </div>
                      <FileText className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Timestamps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Created:</span>{' '}
                    <span className="text-gray-900 font-semibold">
                      {formatDateTime(evaluation.createdAt)}
                    </span>
                  </div>
                  {evaluation.updatedAt && (
                    <div>
                      <span className="text-gray-600">Updated:</span>{' '}
                      <span className="text-gray-900 font-semibold">
                        {formatDateTime(evaluation.updatedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'criteria' && (
            <div className="space-y-4">
              {evaluation.criteria && evaluation.criteria.length > 0 ? (
                evaluation.criteria.map((criterion, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold  text-[19px] text-gray-900">{criterion.category}</h4>
                        <p className="text-gray-300 text-sm mt-1">{criterion.description}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {criterion.weight}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No criteria defined for this evaluation.
                </div>
              )}
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-4">
              {evaluation.questions && evaluation.questions.length > 0 ? (
                evaluation.questions.map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                            {question.questionType?.replace('_', ' ').toUpperCase()}
                          </span>
                          {question.required && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-gray-900 font-medium">{question.questionText}</p>
                        {question.options && question.options.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-xs font-semibold">
                                  {optIndex + 1}
                                </span>
                                <span>{option.text}</span>
                                {option.value !== undefined && (
                                  <span className="text-xs text-gray-500">({option.value})</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No questions defined for this evaluation.
                </div>
              )}
            </div>
          )}

          
        </div>
      </div>
    </div>
  );
};

export default ViewsinglIvaluation;

