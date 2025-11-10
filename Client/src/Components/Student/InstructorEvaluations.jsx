import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEvaluationById,
  submitEvaluationResponse,
} from "@/Store/EvaluationSlice";
import { fetchAllUsers } from "@/Store/UsersDataSlice";
import {
  Loader2,
  CheckCircle,
  ChevronDown,
  AlertCircle,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import logo from "../../assets/logo_2.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const InstructorEvaluations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { evaluation, status, error } = useSelector(
    (state) => state.evaluations
  );
  const [responses, setResponses] = useState({});
  const [overallComment, setOverallComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [courseCode, setCourseCode] = useState("");

  const { user } = useSelector((state) => state.auth);
  const { users = [], loading: usersLoading } = useSelector(
    (state) => state.usersData || {}
  );

  const totalScore =
    evaluation?.criteria?.reduce((sum, criterion) => {
      const response = responses[criterion._id];
      const score = response?.rating || 0;
      return sum + score;
    }, 0) || 0;
  // Fetch users on component mount
  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Filter instructors from the same department
  const instructorsInDepartment =
    users.filter(
      (userI) =>
        userI?.role === "instructor" && userI?.department === user?.department
    ) || [];


  // Set the first instructor as default if none selected
  useEffect(() => {
    if (instructorsInDepartment.length > 0 && !selectedInstructor) {
      setSelectedInstructor(instructorsInDepartment[0]._id);
    }
  }, [instructorsInDepartment]);
  // Load evaluation data when instructor is selected
  useEffect(() => {
    if (selectedInstructor && id) {
      dispatch(fetchEvaluationById(id))
        .unwrap()
        .catch((error) => {
          console.error("Error fetching evaluation:", error);
          toast.error("Failed to load evaluation data");
        });
    }
  }, [id, selectedInstructor, dispatch]);

  // Handle response change
  const handleResponseChange = (criteriaId, value) => {
    // Ensure value is a number and within valid range
    let numericValue = parseInt(value) || 0;
    console.log((numericValue = +value));
    setResponses((prev) => ({
      ...prev,
      [criteriaId]: {
        criteriaId: criteriaId,
        rating: numericValue,
        comments: prev[criteriaId]?.comments || "",
      },
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedInstructor) {
      toast.error("Please select an instructor");
      return;
    }

    setIsSubmitting(true);

    // Format responses to match backend expectations
    const formattedResponses = Object.values(responses);

    // Check if all criteria have been responded to
    if (evaluation?.criteria?.length !== formattedResponses.length) {
      toast.error("Please complete all criteria before submitting");
      setIsSubmitting(false);
      return;
    }

    try {
      await dispatch(
        submitEvaluationResponse({
          id,
          responses: formattedResponses,
          overallComment,
          courseCode,
        })
      ).unwrap();
      toast.success("Evaluation submitted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error?.message || "Failed to submit evaluation");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading evaluation...</span>
      </div>
    );
  }

  // Error state
  if (status === "failed") {
    return (
      <div className="text-center p-4 text-red-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>Error: {error || "Failed to load evaluation"}</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  // No evaluation found
  if (!evaluation) {
    return (
      <div className="text-center p-4">
        <p>No evaluation found.</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container bg-(--six)  mt-10 mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 bg-(--six) text-white hover:bg-(--five) cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2 " />
            Back
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center">
              <img src={logo} alt="logo" className="w-30 mr-4" />
              <h1 className="text-2xl font-bold text-gray-900">
                {evaluation.title}
              </h1>
            </div>

            {usersLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : instructorsInDepartment.length > 0 ? (
              <div className="w-full md:w-auto mt-4 md:mt-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Instructor
                </label>
                <Select
                  value={selectedInstructor}
                  onValueChange={setSelectedInstructor}
                >
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Select an instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructorsInDepartment.map((instructor) => (
                      <SelectItem key={instructor._id} value={instructor._id}>
                        {console.log(instructor.fullName)}
                        {instructor.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No instructors available in your department
              </p>
            )}
          </div>
          <p className="text-gray-600 mt-1">{evaluation.description}</p>

          {/* Course Code Input */}
          <div className="mt-4">
            <label
              htmlFor="courseCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Course Code
            </label>
            <input
              type="text"
              id="courseCode"
              className="w-full md:w-64 text-[16px] p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter course code"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              required
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {evaluation.academicYear} {evaluation.semester}
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                evaluation.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {evaluation.status}
            </div>
          </div>
        </div>

        {/* Evaluation Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {evaluation.criteria?.map((criterion) => (
            <div key={criterion._id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="">
                  <h2 className="text-lg font-semibold mb-4">
                    {criterion.category}
                  </h2>
                  <p className="text-[16px] font-light">
                    {criterion.description}
                  </p>
                </div>
                <div className="font-light text-[17px] flex  items-center gap-2">
                  <input
                    type="number"
                    max={criterion.weight}
                    min={0}
                    step="1"
                    className="my-2 p-2 shadow-lg rounded-lg w-30 bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={responses[criterion._id]?.rating ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        value === "" ||
                        (parseInt(value) >= 0 &&
                          parseInt(value) <= criterion.weight)
                      ) {
                        handleResponseChange(criterion._id, value);
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure the value is within bounds when input loses focus
                      const value = parseInt(e.target.value) || 0;
                      const boundedValue = Math.min(
                        Math.max(value, 0),
                        criterion.weight
                      );
                      if (value !== boundedValue) {
                        handleResponseChange(criterion._id, boundedValue);
                      }
                    }}
                    placeholder={`0-${criterion.weight}`}
                    required
                  />
                  <span>weight {criterion.weight}%</span>
                </div>
              </div>
              {criterion.questions?.map((question) => (
                <div key={question._id} className="mb-6">
                  <p className="font-medium mb-2">{question.text}</p>
                </div>
              ))}
            </div>
          ))}

          {/* Overall Comment */}
          <div className="mt-8">
            <p className="text-[16px] text-(--two) bg-(--six) p-2 my-3">
              TOTAL SCORE: {totalScore} /{" "}
              {evaluation?.criteria?.reduce((sum, c) => sum + c.weight, 0) || 0}
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Comments
            </label>
            <textarea
              rows={4}
              className="w-full bg-white text-[16px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional comments about the instructor..."
              value={overallComment}
              onChange={(e) => setOverallComment(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-900 cursor-pointer hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Evaluation"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstructorEvaluations;
