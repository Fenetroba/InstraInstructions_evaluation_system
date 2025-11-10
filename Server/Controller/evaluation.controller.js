import EvaluationForm from '../Model/EvaluationForm.model.js';
import EvaluationResponse from '../Model/EvaluationResponse.model.js';
import ErrorResponse from '../Middleware/ValidateRequest.js';

// @desc    Create evaluation form (Quality Officer)
// @route   POST /api/evaluations
// @access  Private/QualityOfficer
export const createEvaluationForm = async (req, res, next) => {
  try {
    const { title, description, academicYear, semester, category, criteria, startDate, endDate } = req.body;

    // Create evaluation form
    const evaluationForm = new EvaluationForm({
      title,
      description,
      academicYear,
      semester,
      category,
      criteria,
      startDate,
      endDate,
      createdBy: req.user.id,
      status: 'draft'
    });

    await evaluationForm.save();

    res.status(201).json({
      success: true,
      data: evaluationForm
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit evaluation response (Student/Instructor)
// @route   POST /api/evaluations/:id/responses
// @access  Private/Student,Instructor
export const submitEvaluationResponse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { responses, overallComment } = req.body;
    const userId = req.user.id;

    // Get evaluation form
    const evaluation = await EvaluationForm.findById(id);
    
    if (!evaluation) {
      return res.status(404).json('Evaluation form not found', 404);
    }

    // Check if evaluation is active
    const now = new Date();
    if (evaluation.status !== 'active' || evaluation.startDate > now || evaluation.endDate < now) {
      return res.status(400).json('This evaluation is not currently active', 400);
    }

    // Check if user has already submitted a response
    const existingResponse = await EvaluationResponse.findOne({
      evaluation: id,
      $or: [
        { student: userId },
        { instructor: userId }
      ]
    });

    if (existingResponse) {
      return res.status(400).json('You have already submitted a response for this evaluation', 400);
    }

    // Validate responses match criteria
    if (responses.length !== evaluation.criteria.length) {
      return res.status(400).json('Number of responses does not match number of criteria', 400);
    }

    // Create response
    const response = new EvaluationResponse({
      evaluation: id,
      student: evaluation.category !== 'instructors' ? userId : null,
      instructor: evaluation.category !== 'students' ? userId : null,
      courseCode: evaluation.courseCode,
      responses,
      overallComment
    });

    await response.save();

    // Add response to evaluation
    evaluation.responses.push(response._id);
    evaluation.responseCount = evaluation.responses.length;
    await evaluation.save();

    res.status(201).json({
      success: true,
      data: response
    });
  } catch (error) {
    next(error);
  }
};

export const getAllEvaluationForms = async (req, res, next) => {
  try {
    const evaluations = await EvaluationForm.find();
    res.status(200).json({
      success: true,
      data: evaluations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get evaluation form
// @route   GET /api/evaluations/:id
// @access  Private
export const getEvaluationForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const evaluation = await EvaluationForm.findById(id)
      .populate('createdBy', 'name email');

    if (!evaluation) {
      return res.status(400).json('Evaluation form not found', 404);
    }

    // Check if user has permission to view this evaluation
    if (req.user.role === 'student' && evaluation.category === 'instructors') {
    return res.status(statusCode).json({
  success: false,
  error: 'Error message'
});
    }

    if (req.user.role === 'instructor' && evaluation.category === 'Students') {
return res.status(statusCode).json({
  success: false,
  error: 'Error message'
});
    }

    res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvaluationForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const evaluation = await EvaluationForm.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get evaluation responses (Quality Officer)
// @route   GET /api/evaluations/:id/responses
// @access  Private/QualityOfficer
export const getEvaluationResponses = async (req, res, next) => {
  try {
    const { id } = req.params;

    const responses = await EvaluationResponse.find({ evaluation: id })
      .populate('student', 'name email')
      .populate('instructor', 'name email');

    res.status(200).json({
      success: true,
      count: responses.length,
      data: responses
    });
  } catch (error) {
    next(error);
  }
};
export const updateEvaluationStatus=async(req,res)=>{
     try {
      const {id}=req.params;
      const {status}=req.body;
      const evaluation=await EvaluationForm.findByIdAndUpdate(id,{status});
      res.status(200).json({
        success:true,
        data:evaluation
      })
     } catch (error) {
       next(error);
     }
}