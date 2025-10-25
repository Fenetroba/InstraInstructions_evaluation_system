import EvaluationForm  from '../Model/EvaluationForm.model.js';
import { validationResult } from 'express-validator';
import asyncHandler  from 'express-async-handler';

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
      course,
      department,
      criteria,
      questions,
      startDate,
      endDate
    } = req.body;

    // Check if an evaluation already exists for this course and semester
    const existingEvaluation = await EvaluationForm.findOne({
      course,
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
      course,
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
export const getEvaluationForms = asyncHandler(async (req, res) => {
  try {
    const {
      instructor,
      course,
      department,
      status,
      academicYear,
      semester,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (instructor) query.instructor = instructor;
    if (course) query.course = course;
    if (department) query.department = department;
    if (status) query.status = status;
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;

    // If user is not admin, only show their evaluations or public ones
    if (req.user.role !== 'admin') {
      query.$or = [
        { instructor: req.user.id },
        { status: 'active' }
      ];
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: [
        { path: 'instructor', select: 'fullName email' },
        { path: 'course', select: 'name code' },
        { path: 'department', select: 'name' }
      ]
    };

    const forms = await EvaluationForm.paginate(query, options);

    res.status(200).json({
      success: true,
      data: forms
    });
  } catch (error) {
    console.error('Error fetching evaluation forms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluation forms',
      error: error.message
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
      .populate('course', 'name code')
      .populate('department', 'name')
      .populate('responses.student', 'fullName email');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation form not found'
      });
    }

    // Check permissions
    if (
      form.instructor._id.toString() !== req.user.id.toString() &&
      req.user.role !== 'admin' &&
      form.status !== 'active'
    ) {
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

    await form.remove();

    res.status(200).json({
      success: true,
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

