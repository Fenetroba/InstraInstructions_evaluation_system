import mongoose from 'mongoose';

const { Schema } = mongoose;

const evaluationResponseSchema = new Schema({
  evaluation: {
    type: Schema.Types.ObjectId,
    ref: 'EvaluationForm',
    required: true
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseCode: {
    type: String,
    required: true
  },
  responses: [{
    criteriaId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    }
  }],
  overallComment: {
    type: String,
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure a student can only submit one evaluation per instructor per course
evaluationResponseSchema.index(
  { evaluation: 1, student: 1 },
  { unique: true }
);

const EvaluationResponse = mongoose.model('EvaluationResponse', evaluationResponseSchema);

export default EvaluationResponse;
