import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Evaluation title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required']
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: {
      values: ['Spring', 'Summer', 'Fall'],
      message: 'Semester must be either Spring, Summer, or Fall'
    }
  },

  // Relationships
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAuth',
    required: [true, 'Instructor is required']
  },
  courseCode: {
    type: String,
    default:''
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },

  // Evaluation Criteria
  criteria: [{
    category: {
      type: String,
      required: [true, 'Category is required']
    },
    description: {
      type: String,
      required: [true, 'Criteria description is required']
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [1, 'Weight must be at least 1'],
      max: [100, 'Weight cannot exceed 100']
    }
  }],

  // Evaluation Questions
  questions: [{
    questionText: {
      type: String,
      required: [true, 'Question text is required']
    },
    questionType: {
      type: String,
      enum: ['multiple_choice', 'scale', 'text'],
      required: [true, 'Question type is required']
    },
    options: [{
      text: String,
      value: Number
    }],
    required: {
      type: Boolean,
      default: false
    },
    criteriaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'evaluation.criteria._id'
    }
  }],

  // Status and Dates
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(endDate) {
        return endDate > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },

  // Responses
  responses: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserAuth',
      required: true
    },
    answers: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      answer: mongoose.Schema.Types.Mixed,
      score: {
        type: Number,
        min: 0,
        max: 5
      }
    }],
    submittedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }],

  // Analytics
  averageScore: {
    type: Number,
    min: 0,
    max: 5
  },
  responseCount: {
    type: Number,
    default: 0
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAuth',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAuth'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
evaluationSchema.index({ instructor: 1, status: 1 });
evaluationSchema.index({ course: 1, academicYear: 1, semester: 1 });
evaluationSchema.index({ status: 1, endDate: 1 });

// Virtual for duration in days
evaluationSchema.virtual('durationInDays').get(function() {
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save hook to update average score
evaluationSchema.pre('save', function(next) {
  if (this.responses && this.responses.length > 0) {
    const totalScores = this.responses.reduce((sum, response) => {
      const responseScore = response.answers.reduce((s, a) => s + (a.score || 0), 0) / response.answers.length;
      return sum + responseScore;
    }, 0);
    this.averageScore = totalScores / this.responses.length;
    this.responseCount = this.responses.length;
  }
  next();
});

const EvaluationForm = mongoose.model('EvaluationForm', evaluationSchema);

export default EvaluationForm;