import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const { Schema } = mongoose;



// Main Evaluation Form Schema
const evaluationFormSchema = new Schema({
  // Basic Information
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    // required: [true, 'Instructor is required']
  },
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
    enum: {
      values: ['Spring', 'Summer', 'Fall'],
      message: 'Semester must be Spring, Summer, or Fall'
    },
    required: [true, 'Semester is required']
  },
  courseCode: {
    type: String,
    // required: [true, 'Course code is required']
  },
  department: {
    type: String,
    // required: [true, 'Department is required']
  },



  // Criteria
  criteria: [{
    
    category: {
      type: String,
      required: [true, 'Category is required for each criteria'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required for each criteria'],
      trim: true
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required for each criteria'],
      min: 0,
      max: 100
    }

  }],

  // Timing
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

  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft'
  },



  // Responses
  responses: [{
    type: Schema.Types.ObjectId,
    ref: 'EvaluationResponse'
  }],
  
  // Analytics
  averageScore: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  responseCount: {
    type: Number,
    default: 0
  },

  // Metadata
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
evaluationFormSchema.index({ instructor: 1, status: 1 });
evaluationFormSchema.index({ startDate: 1, endDate: 1 });
evaluationFormSchema.index({ 'responses.student': 1 });

// Virtual for checking if evaluation is active
evaluationFormSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now;
});

// Pre-save hook to update response count
evaluationFormSchema.pre('save', function(next) {
  // Only update responseCount if responses array exists
  if (this.responses) {
    this.responseCount = this.responses.length;
  }
  next();
});

// Add pagination plugin
evaluationFormSchema.plugin(mongoosePaginate);

const EvaluationForm = mongoose.model('EvaluationForm', evaluationFormSchema);

export default EvaluationForm;