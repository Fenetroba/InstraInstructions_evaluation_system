import express from 'express';
import { body, param, query } from 'express-validator';
import {
  createEvaluationForm,
  getEvaluationForms,
  getEvaluationFormById,
  updateEvaluationForm,
  deleteEvaluationForm,
  submitResponse
} from '../Controller/EvaluationForm.Controller.js';
import { protect, authorize } from '../Middleware/protect.js';
import validateRequest from '../Middleware/ValidateRequest.js';

const router = express.Router();

// Validation middleware
const validateEvaluationForm = [
  body('title').notEmpty().withMessage('Title is required'),
  body('academicYear').notEmpty().withMessage('Academic year is required'),
  body('semester').isIn(['Spring', 'Summer', 'Fall']).withMessage('Invalid semester'),
  body('department').isMongoId().withMessage('Invalid department ID'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date'),
  validateRequest
];


const validateResponse = [
  body('answers').isArray({ min: 1 }).withMessage('At least one answer is required'),
  validateRequest
];

// Protected routes
router.use(protect);

// Get all evaluation forms
router.get('/', validateRequest, getEvaluationForms);
// Get single evaluation form
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid evaluation form ID'),
    validateRequest
  ],
  getEvaluationFormById
);

// Admin-only routes
router.use(authorize('admin', 'quality_officer'));

// Create new evaluation form
router.post('/', validateEvaluationForm, createEvaluationForm);

// Update evaluation form
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid evaluation form ID'),
    ...validateEvaluationForm
  ],
  updateEvaluationForm
);

// Delete evaluation form
router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid evaluation form ID')
  ],
  deleteEvaluationForm
);

// Submit evaluation response
router.post(
  '/:id/responses',
  [
    protect,
    param('id').isMongoId().withMessage('Invalid evaluation form ID'),
    ...validateResponse
  ],
  submitResponse
);

export default router;