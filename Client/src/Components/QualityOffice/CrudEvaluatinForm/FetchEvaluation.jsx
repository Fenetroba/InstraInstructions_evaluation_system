import React, { useEffect, useState } from "react";
import { Search, Trash2, Eye, Loader2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  fetchEvaluations,
  deleteEvaluation,
  selectAllEvaluations,
  selectEvaluationStatus,
  selectEvaluationError,
  updateEvaluationStatus,
} from "../../../Store/EvaluationSlice";
// Import the Switch component from the correct path
// Make sure to create this component if it doesn't exist
import Switch from "./Switch";

const FetchEvaluation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Selectors
  const evaluations = useSelector(selectAllEvaluations);
  const status = useSelector(selectEvaluationStatus);
  const error = useSelector(selectEvaluationError);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Log evaluations when they change


  // Fetch evaluations on component mount
  useEffect(() => {
    const loadEvaluations = async () => {
      try {
        const result = await dispatch(fetchEvaluations()).unwrap();
      } catch (err) {
        toast.error(err.message || "Failed to fetch evaluations");
      }
    };

    loadEvaluations();
  }, [dispatch]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle delete evaluation
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this evaluation?")) {
      dispatch(deleteEvaluation(id));
    }
  };

  // In FetchEvaluation.jsx
  const handleStatusToggle = async (evaluationId, isActive) => {
    try {
      await dispatch(
        updateEvaluationStatus({
          id: evaluationId,
          status: isActive ? "active" : "inactive",
        })
      ).unwrap();
      toast.success("Evaluation status updated successfully");
      // This will trigger a re-fetch of evaluations
      await dispatch(fetchEvaluations()).unwrap();
    } catch (error) {
      toast.error(error.message || "Failed to update evaluation status");
    }
  };

  // Initialize evaluations as empty array if not loaded yet
  const evaluationsList = Array.isArray(evaluations) ? evaluations : [];

  // Filter evaluations based on search term with null checks
  const filteredEvaluations = evaluationsList.filter((evaluation) => {
    if (!evaluation) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      String(evaluation.title || "")
        .toLowerCase()
        .includes(searchLower) ||
      String(evaluation.description || "")
        .toLowerCase()
        .includes(searchLower) ||
      String(evaluation.academicYear || "").includes(searchTerm) ||
      String(evaluation.semester || "")
        .toLowerCase()
        .includes(searchLower)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEvaluations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format date with null check
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return "Invalid Date";
    }
  };

  if (status === "failed") {
    return (
      <div className="text-center p-4">
        <div className="inline-flex items-center p-4 text-red-700 bg-red-100 rounded-lg">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Error loading evaluations: {error || "Unknown error occurred"}
          </span>
        </div>
        <button
          onClick={() => dispatch(fetchEvaluations())}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Evaluation Forms
          </h2>
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 sm:text-sm"
                placeholder="Search evaluations..."
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responses
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((evaluation) => (
                  <tr key={evaluation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {evaluation.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {evaluation.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {evaluation.academicYear} {evaluation.semester}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Switch
                          id={evaluation._id}
                          checked={evaluation.status === "active"}
                          onChange={(isActive) =>
                            handleStatusToggle(evaluation._id, isActive)
                          }
                        />
                        <span className="ml-2 text-sm text-gray-500">
                          {evaluation?.status === "active"
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(evaluation.startDate)} -{" "}
                      {formatDate(evaluation.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evaluation.responseCount || 0} responses
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() =>
                          navigate(`/evaluation/${evaluation._id}`)
                        }
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <Eye className="h-5 w-5" />
                      </button>

                      <button
                        onClick={() => handleDelete(evaluation._id)}
                        disabled={isDeleting[evaluation._id]}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Delete"
                      >
                        {isDeleting[evaluation._id] ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    {searchTerm
                      ? "No matching evaluations found"
                      : "No evaluations available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  paginate(
                    currentPage < totalPages ? currentPage + 1 : totalPages
                  )
                }
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredEvaluations.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {filteredEvaluations.length}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">First</span>
                    &laquo;
                  </button>
                  <button
                    onClick={() =>
                      paginate(currentPage > 1 ? currentPage - 1 : 1)
                    }
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() =>
                      paginate(
                        currentPage < totalPages ? currentPage + 1 : totalPages
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => paginate(totalPages)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Last</span>
                    &raquo;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FetchEvaluation;
