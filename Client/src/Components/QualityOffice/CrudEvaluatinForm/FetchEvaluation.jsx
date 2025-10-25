import React, { useState, useEffect } from 'react';
import { Search, Download, Trash2, Eye, Loader2 } from 'lucide-react';
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

  // Fetch evaluations on component mount
  useEffect(() => {
    dispatch(fetchAllEvaluations());
  }, [dispatch]);

  // Handle search
  const filteredEvaluations = evaluations.filter(evaluation => 
    evaluation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluation.courseCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle view evaluation
  const handleView = (id) => {
    navigate(`/evaluations/${id}`);
  };

  // Handle delete evaluation
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this evaluation?')) return;
    
    try {
      setIsDeleting(prev => ({ ...prev, [id]: true }));
      await dispatch(deleteEvaluation(id)).unwrap();
      toast.success('Evaluation deleted successfully');
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

  if (status === 'loading' && !evaluations.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading evaluations...</span>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error: {error || 'Failed to load evaluations'}</p>
        <Button 
          onClick={() => dispatch(fetchAllEvaluations())} 
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">Evaluation Forms</h1>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search evaluations..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredEvaluations.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            {searchTerm ? 'No matching evaluations found' : 'No evaluations available'}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default FetchEvaluation;