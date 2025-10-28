import EvaluationForm  from '../Model/EvaluationForm.model.js';
import { validationResult } from 'express-validator';
import asyncHandler  from 'express-async-handler';
import UserAuth from '../Model/UserAuth.model.js';  // Add this line
export const createEvaluationForm = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const {
      title,
      description,
      academicYear,
      semester,
      instructor,
      courseCode,
      department,
      criteria,
      questions,
      startDate,
      endDate
    } = req.body;

    // Check if an evaluation already exists for this course and semester
    const existingEvaluation = await EvaluationForm.findOne({
      courseCode,
      academicYear,
      semester,
      status: { $ne: 'archived' }
    });

    if (existingEvaluation) {
      return res.status(400).json({
        success: false,
        message: 'An active evaluation already exists for this course and semester'
      });
    }

    const evaluationForm = new EvaluationForm({
      title,
      description,
      academicYear,
      semester,
      instructor,
      courseCode,
      department,
      criteria,
      questions,
      startDate,
      endDate,
      createdBy: req.user.id
    });

    const savedForm = await evaluationForm.save();
    res.status(201).json({
      success: true,
      data: savedForm
    });
  } catch (error) {
    console.error('Error creating evaluation form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create evaluation form',
      error: error.message
    });
  }
});

// @desc    Get all evaluation forms
// @route   GET /api/evaluation-forms
// @access  Private
// @desc    Get all evaluation forms with pagination
// @route   GET /api/evaluation-forms
// @access  Private
export const getEvaluationForms = asyncHandler(async (req, res) => {
  try {
    // Parse and validate pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    // Validate pagination values
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters'
      });
    }

    // Build query options
    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [
        { 
          path: 'instructor', 
          select: 'fullName email department'
        },
        {
          path: 'courseCode',
          select: 'name code'
        }
      ],
      select: '-__v' // Exclude version key
    };

    // Build query based on user role
    const query = {};

    switch (req.user.role) {
      case 'Student':
        // Students see active evaluations for their department, within the valid date range,
        // and which they have not yet completed.
        query.status = 'active';
        query.department = req.user.department;
        query.startDate = { $lte: new Date() };
        query.endDate = { $gte: new Date() };
        // Exclude evaluations the student has already responded to
        query['responses.student'] = { $ne: req.user.id };
        break;
      case 'department_head':
        // Department heads see evaluations from their department
        if (req.user.department) {
          query.department = req.user.department;
        }
        break;
      case 'instructor':
        // Instructors see evaluations they are assigned to
        query.instructor = req.user.id;
        break;
      // Admin and quality_officer can see all evaluations (no query modifications needed)
      case 'Student':
      case 'quality_officer':
      default:
        break;
    }

    // Execute query with pagination
    const evaluations = await EvaluationForm.paginate(query, options);
    
    // Format response
    const response = {
      success: true,
      data: {
        docs: evaluations.docs,
        totalDocs: evaluations.totalDocs,
        limit: evaluations.limit,
        totalPages: evaluations.totalPages,
        page: evaluations.page,
        pagingCounter: evaluations.pagingCounter,
        hasPrevPage: evaluations.hasPrevPage,
        hasNextPage: evaluations.hasNextPage,
        prevPage: evaluations.prevPage,
        nextPage: evaluations.nextPage
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluation forms',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});
// @desc    Get single evaluation form
// @route   GET /api/evaluation-forms/:id
// @access  Private
export const getEvaluationFormById = asyncHandler(async (req, res) => {
  try {
    const form = await EvaluationForm.findById(req.params.id)
      .populate('instructor', 'fullName email')
      .populate('courseCode', 'name code')
      .populate('responses.student', 'fullName email');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation form not found'
      });
    }

    // Check permissions
    // Allow access to: admin, quality_officer, department_head, and the instructor who created it
    const isAuthorized = 
      req.user.role === 'Student' ||
      req.user.role === 'quality_officer' ||
      req.user.role === 'department_head' ||
      form.instructor._id.toString() === req.user.id.toString() ||
      form.status === 'active';
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this evaluation form'
      });
    }

    res.status(200).json({
      success: true,
      data: form
    });
  } catch (error) {
    console.error('Error fetching evaluation form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluation form',
      error: error.message
    });
  }
});

// @desc    Update evaluation form
// @route   PUT /api/evaluation-forms/:id
// @access  Private/Admin
export const updateEvaluationForm = asyncHandler(async (req, res) => {
  try {
    const form = await EvaluationForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation form not found'
      });
    }

    // Prevent updating if form is already active or completed
    if (form.status === 'active' || form.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ${form.status} evaluation form`
      });
    }

    const updates = {
      ...req.body,
      updatedBy: req.user.id,
      updatedAt: Date.now()
    };

    const updatedForm = await EvaluationForm.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedForm
    });
  } catch (error) {
    console.error('Error updating evaluation form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update evaluation form',
      error: error.message
    });
  }
});

// @desc    Delete evaluation form
// @route   DELETE /api/evaluation-forms/:id
// @access  Private/Admin
export const deleteEvaluationForm = asyncHandler(async (req, res) => {
  try {
    const form = await EvaluationForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation form not found'
      });
    }

    // Prevent deleting if form has responses
    if (form.responses.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an evaluation form with responses'
      });
    }

    await EvaluationForm.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Evaluation form deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Error deleting evaluation form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete evaluation form',
      error: error.message
    });
  }
});

// @desc    Submit evaluation response
// @route   POST /api/evaluation-forms/:id/responses
// @access  Private
export const submitResponse = asyncHandler(async (req, res) => {
  try {
    const form = await EvaluationForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation form not found'
      });
    }

    // Check if evaluation is active
    if (form.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This evaluation is not currently active'
      });
    }

    // Check if evaluation period is valid
    const now = new Date();
    if (now < form.startDate || now > form.endDate) {
      return res.status(400).json({
        success: false,
        message: 'This evaluation is not currently accepting responses'
      });
    }

    // Check if user has already submitted a response
    const existingResponse = form.responses.find(
      r => r.student.toString() === req.user.id.toString()
    );

    if (existingResponse) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a response for this evaluation'
      });
    }

    // Validate answers
    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No answers provided'
      });
    }

    // Calculate scores if applicable
    const response = {
      student: req.user.id,
      answers,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    form.responses.push(response);
    form.responseCount = form.responses.length;
    
    // Update average score if applicable
    if (answers.some(a => a.score !== undefined)) {
      const totalScores = form.responses.reduce((sum, r) => {
        const responseScore = r.answers.reduce((s, a) => s + (a.score || 0), 0) / r.answers.length;
        return sum + responseScore;
      }, 0);
      form.averageScore = totalScores / form.responses.length;
    }

    await form.save();

    res.status(201).json({
      success: true,
      message: 'Response submitted successfully',
      data: response
    });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit response',
      error: error.message
    });
  }
});
