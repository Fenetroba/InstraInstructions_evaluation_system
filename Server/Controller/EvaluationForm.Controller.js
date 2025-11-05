import EvaluationForm from '../Model/EvaluationForm.model.js';
import UserAuth from '../Model/UserAuth.model.js';
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

/**
 * @desc    Get all evaluations with filtering and pagination
 * @route   GET /api/evaluations
 * @access  Private
 */
export const getAllEvaluations = asyncHandler(async (req, res) => {
  try {
    const { 
      status, 
      instructor, 
      course, 
      department,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (instructor) query.instructor = instructor;
    if (course) query.course = course;
    if (department) query.department = department;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: [
        { path: 'instructor', select: 'fullName email' },
        { path: 'courseCode', select: 'name code' },
        { path: 'createdBy', select: 'fullName email' }
      ]
    };

    const evaluations = await EvaluationForm.paginate(query, options);

    res.status(200).json({
      success: true,
      count: evaluations.totalDocs,
      totalPages: evaluations.totalPages,
      currentPage: evaluations.page,
      data: evaluations.docs
    });
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluations',
      error: error.message
    });
  }
});

export const getEvaluationById = asyncHandler(async (req, res) => {
  try {
    const evaluation = await EvaluationForm.findById(req.params.id)
      .populate('instructor', 'fullName email')
      .populate('courseCode', 'name code')
      .populate('createdBy', 'fullName email');

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluation',
      error: error.message
    });
  }
});

/**
 * @desc    Create new evaluation
 * @route   POST /api/evaluations
 * @access  Private/Admin
 */
export const createEvaluation = asyncHandler(async (req, res) => {
  try {
    // Check if user is authenticated and has an ID
    if (!req.user || !req.user._id) {
      console.error('No user found in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Create evaluation with user reference
    const evaluationData = {
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    };

    console.log('Creating evaluation with data:', {
      ...evaluationData,
      createdBy: req.user._id,
      userEmail: req.user.email // For debugging
    });

    const evaluation = new EvaluationForm(evaluationData);
    await evaluation.save();

    res.status(201).json({
      success: true,
      message: 'Evaluation created successfully',
      data: evaluation
    });
  } catch (error) {
    console.error('Error creating evaluation:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create evaluation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @desc    Update evaluation
 * @route   PUT /api/evaluations/:id
 * @access  Private/Admin
 */
export const updateEvaluation = asyncHandler(async (req, res) => {
  try {
    const evaluation = await EvaluationForm.findById(req.params.id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found'
      });
    }

    // Prevent updates if evaluation is active/completed
    if (evaluation.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update an active or completed evaluation'
      });
    }

    Object.assign(evaluation, req.body);
    evaluation.updatedBy = req.user._id;
    await evaluation.save();

    res.status(200).json({
      success: true,
      message: 'Evaluation updated successfully',
      data: evaluation
    });
  } catch (error) {
    console.error('Error updating evaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update evaluation',
      error: error.message
    });
  }
});

/**
 * @desc    Delete evaluation
 * @route   DELETE /api/evaluations/:id
 * @access  Private/Admin
 */
export const deleteEvaluation = asyncHandler(async (req, res) => {
  try {
    const evaluation = await EvaluationForm.findById(req.params.id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found'
      });
    }

    // Prevent deletion if evaluation has responses
    if (evaluation.responses.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an evaluation with responses'
      });
    }

    // Use findByIdAndDelete instead of remove()
    await EvaluationForm.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Evaluation deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete evaluation',
      error: error.message
    });
  }
});
/**
 * @desc    Submit evaluation response
 * @route   POST /api/evaluations/:id/responses
 * @access  Private
 */
export const submitResponse = asyncHandler(async (req, res) => {
  try {
    const evaluation = await EvaluationForm.findById(req.params.id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found'
      });
    }

    // Check if evaluation is active
    if (evaluation.status !== 'active') {
      let message = 'This evaluation is not currently accepting responses';
      if (evaluation.status === 'draft') {
        message = 'This evaluation is still in draft mode and not yet open for responses';
      } else if (evaluation.status === 'completed') {
        message = 'This evaluation has been completed and is no longer accepting responses';
      } else if (evaluation.status === 'archived') {
        message = 'This evaluation has been archived and is no longer accepting responses';
      }
      
      return res.status(400).json({
        success: false,
        message,
        status: evaluation.status
      });
    }

    // Check evaluation period
    const now = new Date();
    if (now < evaluation.startDate) {
      return res.status(400).json({
        success: false,
        message: `This evaluation is not open yet. It will start on ${evaluation.startDate.toLocaleDateString()}`,
        startDate: evaluation.startDate,
        currentDate: now
      });
    }
    
    if (now > evaluation.endDate) {
      return res.status(400).json({
        success: false,
        message: `This evaluation closed on ${evaluation.endDate.toLocaleDateString()}`,
        endDate: evaluation.endDate,
        currentDate: now
      });
    }

    // Check if user has already submitted
    const existingResponse = evaluation.responses.find(
      r => r.student.toString() === req.user._id.toString()
    );

    if (existingResponse) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a response for this evaluation'
      });
    }

    // Validate criteria scores
    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No criteria scores provided'
      });
    }

    // Map criteria scores to the required format
    const criteriaScores = answers.map(score => ({
      criterionId: score.criterionId,
      score: parseFloat(score.score) || 0,
      comment: score.comment || ''
    }));

    // Validate all criteria are included
    if (criteriaScores.length !== evaluation.criteria.length) {
      return res.status(400).json({
        success: false,
        message: 'Scores for all criteria are required'
      });
    }

    // Validate scores are within range
    for (const score of criteriaScores) {
      const criterion = evaluation.criteria.id(score.criterionId);
      if (!criterion) {
        return res.status(400).json({
          success: false,
          message: `Invalid criterion ID: ${score.criterionId}`
        });
      }
      
      if (score.score < 0 || score.score > criterion.weight) {
        return res.status(400).json({
          success: false,
          message: `Score for ${criterion.category} must be between 0 and ${criterion.weight}`
        });
      }
    }

    // Add response
    evaluation.responses.push({
      student: req.user._id,
      answers: criteriaScores,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      submittedAt: new Date()
    });

    // Update evaluation stats
    const totalScore = criteriaScores.reduce((sum, score) => sum + (parseFloat(score.score) || 0), 0);
    const averageScore = totalScore / criteriaScores.length;
    
    evaluation.averageScore = averageScore;
    evaluation.responseCount = (evaluation.responseCount || 0) + 1;

    await evaluation.save();

    res.status(201).json({
      success: true,
      message: 'Evaluation submitted successfully',
      data: {
        evaluationId: evaluation._id,
        submittedAt: new Date(),
        averageScore: averageScore.toFixed(2)
      }
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

/**
 * @desc    Get evaluations by instructor
 * @route   GET /api/evaluations/instructor/:instructorId
 * @access  Private
 */
export const getEvaluationsByInstructor = asyncHandler(async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { status } = req.query;

    const query = { instructor: instructorId };
    if (status) query.status = status;

    const evaluations = await EvaluationForm.find(query)
      .populate('courseCode', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: evaluations.length,
      data: evaluations
    });
  } catch (error) {
    console.error('Error fetching instructor evaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluations',
      error: error.message
    });
  }
});

/**
 * @desc    Get evaluations for current user
 * @route   GET /api/evaluations/my-evaluations
 * @access  Private
 */
export const getMyEvaluations = asyncHandler(async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    let query = {};

    if (role === 'Student') {
      // Show active evaluations that the student hasn't responded to
      query = {
        status: 'active',
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
        'responses.student': { $ne: userId }
      };
    } else if (role === 'Instructor') {
      // Show all evaluations for the instructor
      query = { instructor: userId };
    } else if (['Admin', 'Quality_Office'].includes(role)) {
      // Show all evaluations for admins
      query = {};
    }

    const evaluations = await EvaluationForm.find(query)
      .populate('instructor', 'fullName email')
      .populate('courseCode', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: evaluations.length,
      data: evaluations
    });
  } catch (error) {
    console.error('Error fetching user evaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluations',
      error: error.message
    });
  }
});