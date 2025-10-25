import React, { useState, useEffect } from 'react';
import { Search, Download, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Mock data - replace with actual API call
const mockEvaluations = [
  { id: 1, title: 'College Team Evaluation Q1', category: 'college_team', date: '2025-10-15', fileUrl: '#' },
  { id: 2, title: 'Self Evaluation Form 2025', category: 'self_evaluate', date: '2025-10-10', fileUrl: '#' },
  { id: 3, title: 'Student Feedback Form', category: 'students', date: '2025-10-05', fileUrl: '#' },
];

const FetchEvaluation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch('/api/evaluations');
        // const data = await response.json();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        setEvaluations(mockEvaluations);
      } catch (error) {
        console.error('Error fetching evaluations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEvaluations = evaluations.filter(evaluation =>
    evaluation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluation.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this evaluation?')) {
      try {
        // Replace with actual delete API call
        // await fetch(`/api/evaluations/${id}`, { method: 'DELETE' });
        setEvaluations(prev => prev.filter(evalItem => evalItem.id !== id));
      } catch (error) {
        console.error('Error deleting evaluation:', error);
      }
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      college_team: 'College Team',
      self_evaluate: 'Self Evaluation',
      students: 'Students',
      immediate_supervisor: 'Immediate Supervisor'
    };
    return labels[category] || category;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded h-12 w-12 border-t-2 border-b-2 border-primary text-2xl">OSU</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-10 overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold">Evaluation Forms</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search evaluations..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredEvaluations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No evaluation forms found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvaluations.map((evaluation) => (
                <tr key={evaluation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {evaluation.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getCategoryLabel(evaluation.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(evaluation.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900">
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-900">
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(evaluation.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FetchEvaluation;