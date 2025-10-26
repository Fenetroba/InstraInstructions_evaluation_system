import React, { useEffect, useState } from 'react';
import { Search, Trash2, Eye, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllEvaluations, deleteEvaluation } from '@/Store/EvaluationSlice';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const FetchEvaluation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { evaluations, status, error } = useSelector((state) => state.evaluations);
  const [isDeleting, setIsDeleting] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (searchTerm && currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Fetch evaluations on component mount and when page changes
  useEffect(() => {
    dispatch(fetchAllEvaluations({ page: currentPage, limit: itemsPerPage }));
  }, [dispatch, currentPage, itemsPerPage]);

  // Handle search - filter the current page's evaluations
  const filteredEvaluations = Array.isArray(evaluations?.docs) 
    ? evaluations.docs.filter(evaluation => 
        (evaluation.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (evaluation.courseCode?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    : [];

  // Calculate total pages
  const totalPages = evaluations?.totalPages || 1;

  const handleView = (id) => {
    navigate(`/evaluations/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this evaluation?')) return;
    
    try {
      setIsDeleting(prev => ({ ...prev, [id]: true }));
      await dispatch(deleteEvaluation(id)).unwrap();
      toast.success('Evaluation deleted successfully');
      // Refresh the evaluations list
      dispatch(fetchAllEvaluations({ page: currentPage, limit: itemsPerPage }));
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      toast.error(error?.message || 'Failed to delete evaluation');
    } finally {
      setIsDeleting(prev => ({ ...prev, [id]: false }));
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get category label
  const getCategoryLabel = (category) => {
    const categories = {
      college_team: 'College Team',
      self_evaluate: 'Self Evaluation',
      students: 'Students',
      immediate_supervisor: 'Supervisor'
    };
    return categories[category] || category;
  };

  if (status === 'loading' && !evaluations?.docs?.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading evaluations...</span>
      </div>
    );
  }

  // Show loading overlay during page changes
  const isLoading = status === 'loading';

  if (status === 'failed') {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error: {error || 'Failed to load evaluations'}</p>
        <Button 
          onClick={() => dispatch(fetchAllEvaluations({ page: currentPage, limit: itemsPerPage }))} 
          variant="outline" 
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Evaluation Forms</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Page {evaluations?.page || 1} of {totalPages} ({evaluations?.totalDocs || 0} total)
            </span>
            <Button onClick={() => navigate('/evaluations/create')}>
              Create New Evaluation
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search evaluations..."
              className={`pl-8 ${searchTerm ? 'pr-8' : ''}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {filteredEvaluations.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {searchTerm 
                ? `No matching evaluations found on this page${evaluations?.docs?.length > 0 ? '. Try navigating to other pages or clearing the search.' : ''}` 
                : 'No evaluations found'}
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
              </div>
            )}
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvaluations.map((evaluation) => (
                  <tr key={evaluation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {evaluation.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {evaluation.courseCode || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getCategoryLabel(evaluation.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(evaluation.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(evaluation._id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(evaluation._id)}
                        disabled={isDeleting[evaluation._id]}
                        className="text-red-600 hover:text-red-900"
                      >
                        {isDeleting[evaluation._id] ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FetchEvaluation;