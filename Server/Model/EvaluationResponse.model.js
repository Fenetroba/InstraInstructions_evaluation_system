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
    required: function() {
      return !this.instructor; // Student is required if instructor is not present
    }
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.student; // Instructor is required if student is not present
    }
  },
  courseCode: {
    type: String,
    // required: true
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

// Ensure a user can only submit one response per evaluation
evaluationResponseSchema.index(
  { evaluation: 1, $or: [
    { student: { $exists: true } },
    { instructor: { $exists: true } }
  ]},
  { unique: true }
);

const EvaluationResponse = mongoose.model('EvaluationResponse', evaluationResponseSchema);

export default EvaluationResponse;
