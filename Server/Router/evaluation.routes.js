import express from 'express';
import {
  createEvaluationForm,
  submitEvaluationResponse,
  getEvaluationForm,
  getEvaluationResponses,
  getAllEvaluationForms,
  deleteEvaluationForm,
  updateEvaluationStatus
} from '../Controller/evaluation.controller.js';
import { protect, authorize } from '../Middleware/protect.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Quality Officer routes
router.route('/').post(authorize('quality_officer'), createEvaluationForm);
router.route('/').get(authorize('quality_officer',"Student"), getAllEvaluationForms);
router.route('/:id/status').patch(authorize('quality_officer'), updateEvaluationStatus);
router.route('/:id').delete(authorize('quality_officer'), deleteEvaluationForm);

// Student/Instructor routes
router.route('/:id')
  .get(authorize('Student', 'instructor', 'quality_officer'), getEvaluationForm);

router.route('/:id/responses')
  .post(authorize('Student', 'instructor'), submitEvaluationResponse)
  .get(authorize('quality_officer'), getEvaluationResponses);

export default router;
