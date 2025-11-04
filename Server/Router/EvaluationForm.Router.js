import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllEvaluations,
  getEvaluationById,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
  submitResponse,
  getEvaluationsByInstructor,
  getMyEvaluations
} from '../Controller/EvaluationForm.Controller.js';
import { protect, authorize } from '../Middleware/protect.js';
import validateRequest from '../Middleware/ValidateRequest.js';

const router = express.Router();

// Validation middleware
const validateEvaluation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('academicYear').notEmpty().withMessage('Academic year is required'),
  body('semester').isIn(['Spring', 'Summer', 'Fall']).withMessage('Invalid semester'),
  body('category').notEmpty().withMessage('Category is required'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date'),
  body('status').optional().isIn(['draft', 'published', 'closed']),
  body('createdBy').isMongoId().withMessage('Invalid creator ID'),
  body('criteria')
    .isArray({ min: 1 }).withMessage('At least one criteria is required')
    .custom(criteria => {
      return criteria.every(item => 
        item.category && 
        item.description && 
        !isNaN(item.weight)
      );
    }).withMessage('Each criteria must have a category, description, and weight'),
  validateRequest
];

const validateResponse = [
  body('answers').isArray().withMessage('Answers must be an array'),
  body('answers.*.questionId').isMongoId().withMessage('Invalid question ID'),
  body('answers.*.answer').notEmpty().withMessage('Answer is required'),
  validateRequest
];

// Apply authentication to all routes
router.use(protect);

// Get all evaluations (with optional filters)
router.get(
  '/',
  [
    query('status').optional().isIn(['draft', 'active', 'completed', 'archived']),
    query('instructor').optional().isMongoId(),
    query('course').optional().isString(),
    query('department').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validateRequest
  ],
  getAllEvaluations
);

// Get evaluations for current user
router.get('/my-evaluations', getMyEvaluations);

// Get evaluations by instructor
router.get(
  '/instructor/:evaluationId',
  [
    param('instructorId').isMongoId().withMessage('Invalid instructor ID'),
    query('status').optional().isIn(['draft', 'active', 'completed', 'archived']),
    validateRequest
  ],
  getEvaluationsByInstructor
);

// Get single evaluation
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid evaluation ID'),
    validateRequest
  ],
  getEvaluationById
);

// Protected admin routes
router.use(authorize(['Admin', 'quality_officer']));

// Create new evaluation
router.post(
  '/',
  [
    ...validateEvaluation,
    body('status').default('draft').isIn(['draft', 'active']),
    validateRequest
  ],
  createEvaluation
);

// Update evaluation
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid evaluation ID'),
    ...validateEvaluation,
    body('status').optional().isIn(['draft', 'active', 'completed', 'archived']),
    validateRequest
  ],
  updateEvaluation
);

// Delete evaluation
router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid evaluation ID'),
    validateRequest
  ],
  deleteEvaluation
);

// Student routes
router.post(
  '/:id/responses',
  [
    param('id').isMongoId().withMessage('Invalid evaluation ID'),
    ...validateResponse
  ],
  submitResponse
);

export default router;