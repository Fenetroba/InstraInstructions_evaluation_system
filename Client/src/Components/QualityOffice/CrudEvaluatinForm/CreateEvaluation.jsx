import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  UserCheck,
  Users,
  User,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createEvaluation } from "@/Store/EvaluationSlice";
import { fetchAllUsers } from "@/Store/UsersDataSlice";

const CATEGORIES = [
  {
    value: "college_team",
    label: "College Team Form",
    icon: <Users className="h-4 w-4" />,
  },
  {
    value: "self_evaluate",
    label: "Self Evaluation",
    icon: <UserCheck className="h-4 w-4" />,
  },
  { value: "students", label: "Students", icon: <User className="h-4 w-4" /> },
  {
    value: "immediate_supervisor",
    label: "Immediate Supervisor",
    icon: <UserCheck className="h-4 w-4" />,
  },
];

const CreateEvaluation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.evaluations);
  const { users } = useSelector((state) => state.usersData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    academicYear: new Date().getFullYear().toString(),
    semester: "Spring",
    category: "",
    instructor: "",
    courseCode: "",
    department: "",
    startDate: "",
    endDate: "",
    criteria: [
      {
        category: "Teaching Effectiveness",
        description: "",
        weight: 0,
      },
    ],
  });
  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);
  const [errors, setErrors] = useState({});

  // Get instructors, courses, and departments from your Redux store
  const instructors = users?.filter((user) => user.role === "instructor") || [];
  const department = users?.filter((user) => user.department);


  useEffect(() => {
    if (status === "succeeded") {
      toast.success("Evaluation created successfully");
    } else if (status === "failed") {
      toast.error(error || "Failed to create evaluation");
    }
  }, [status, error, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCriteriaChange = (index, field, value) => {
    const updatedCriteria = [...formData.criteria];
    updatedCriteria[index] = {
      ...updatedCriteria[index],
      [field]: field === "weight" ? parseInt(value, 10) || 0 : value,
    };
    setFormData((prev) => ({
      ...prev,
      criteria: updatedCriteria,
    }));
  };

  const addCriteria = () => {
    setFormData((prev) => ({
      ...prev,
      criteria: [
        ...prev.criteria,
        { category: "", description: "", weight: 0 },
      ],
    }));
  };

  const removeCriteria = (index) => {
    if (formData.criteria.length > 1) {
      const updatedCriteria = formData.criteria.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        criteria: updatedCriteria,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.instructor) newErrors.instructor = "Instructor is required";
    if (!formData.courseCode) newErrors.courseCode = "Course is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    formData.criteria.forEach((criteria, index) => {
      if (!criteria.category) {
        newErrors[`criteria-${index}-category`] = "Category is required";
      }
      if (!criteria.description) {
        newErrors[`criteria-${index}-description`] = "Description is required";
      }
      if (criteria.weight <= 0 || criteria.weight > 100) {
        newErrors[`criteria-${index}-weight`] =
          "Weight must be between 1 and 100";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Prepare the data to match the backend model
      const evaluationData = {
        title: formData.title,
        description: formData.description,
        academicYear: formData.academicYear,
        semester: formData.semester,
        category: formData.category,
        instructor: formData.instructor, // This should be the instructor's ID
        courseCode: formData.courseCode,
        department: formData.department, // This should be the department ID
        startDate: formData.startDate,
        endDate: formData.endDate,
        criteria: formData.criteria,
        status: 'draft' // Default status
      };

      console.log('Submitting evaluation data:', evaluationData);
      
      const resultAction = await dispatch(createEvaluation(evaluationData));
      const result = resultAction.payload;
      
      if (result?.success) {
        console.log('Evaluation created successfully:', result.data);
        // Optionally reset form or redirect
        // resetForm();
      } else {
        console.error('Failed to create evaluation:', result?.message || 'Unknown error');
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error(error.message || 'Failed to create evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Evaluation</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Evaluation Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter evaluation title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Evaluation Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger
                  className={errors.category ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        {cat.icon}
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            {/* Instructor */}
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Select
                value={formData.instructor}
                onValueChange={(value) =>
                  handleSelectChange("instructor", value)
                }
              >
                <SelectTrigger
                  className={errors.instructor ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select an instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((instructor) => (
                    <SelectItem key={instructor._id} value={instructor._id}>
                      {instructor.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.instructor && (
                <p className="text-sm text-red-500">{errors.instructor}</p>
              )}
            </div>

     
            {/* Course - Only show if category is not 'students' */}
            {formData.category === "students" && (
              <div className="space-y-2">
                <Label htmlFor="course">Course Code</Label>
                <Input
                  id="courseCode"
                  name="courseCode"
                  type="text"
                  value={formData.courseCode || ""}
                  onChange={handleChange}
                  className={errors.courseCode ? "border-red-500" : ""}
                  placeholder="Enter course Code"
                />
                {errors.courseCode && (
                  <p className="text-sm text-red-500">{errors.courseCode}</p>
                )}
              </div>
            )}

            {/* Department */}
            {/* Department Selector */}
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  handleSelectChange("department", value)
                }
              >
                <SelectTrigger
                  className={errors.department ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((dept, i) => (
                    <SelectItem key={i} value={dept._id}>
                      {dept.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-red-500">{errors.department}</p>
              )}
            </div>

            {/* Academic Year */}
            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input
                id="academicYear"
                name="academicYear"
                type="number"
                min="2000"
                max="2100"
                value={formData.academicYear}
                onChange={handleChange}
              />
            </div>

            {/* Semester */}
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select
                value={formData.semester}
                onValueChange={(value) => handleSelectChange("semester", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Spring">Spring</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                  <SelectItem value="Fall">Fall</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                className={errors.startDate ? "border-red-500" : ""}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
                className={errors.endDate ? "border-red-500" : ""}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Criteria Section */}
          <div className="space-y-2">
            <Label>Evaluation Criteria</Label>
            <div className="space-y-4">
              {formData.criteria.map((criteria, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Criterion {index + 1}</h3>
                    {formData.criteria.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriteria(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label>Category</Label>
                      <Input
                        value={criteria.category}
                        onChange={(e) =>
                          handleCriteriaChange(
                            index,
                            "category",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Teaching, Communication"
                        className={
                          errors[`criteria-${index}-category`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors[`criteria-${index}-category`] && (
                        <p className="text-sm text-red-500">
                          {errors[`criteria-${index}-category`]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <Label>Description</Label>
                      <Input
                        value={criteria.description}
                        onChange={(e) =>
                          handleCriteriaChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Describe the criteria"
                        className={
                          errors[`criteria-${index}-description`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors[`criteria-${index}-description`] && (
                        <p className="text-sm text-red-500">
                          {errors[`criteria-${index}-description`]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label>Weight (%)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={criteria.weight}
                        onChange={(e) =>
                          handleCriteriaChange(index, "weight", e.target.value)
                        }
                        className={
                          errors[`criteria-${index}-weight`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors[`criteria-${index}-weight`] && (
                        <p className="text-sm text-red-500">
                          {errors[`criteria-${index}-weight`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCriteria}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Criteria
              </Button>
            </div>
          </div>

          {/* Additional Instructions */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Additional Instructions (Optional)
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Any additional instructions for evaluators..."
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Evaluation"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvaluation;
