import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const { Schema } = mongoose;



// Main Evaluation Form Schema
const evaluationFormSchema = new Schema({
  // Basic Information
  category: {
    type: String,
    required: [true, 'Category is required (e.g., students, instructors)'],
    enum: {
      values: ['College_Team', 'Self_Evaluation', 'Immediate_Supervisior','Student'],
      message: 'Category must be College_Team, Self_Evaluation, Immediate_Supervisior, or Student'
    }
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
      max: 10
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

// Pre-save hook to validate criteria weights
evaluationFormSchema.pre('save', function(next) {
  // Only update responseCount if responses array exists
  if (this.responses) {
    this.responseCount = this.responses.length;
  }
  
  // Validate criteria weights
  // if (this.criteria && this.criteria.length > 0) {
  //   const totalWeight = this.criteria.reduce((sum, criteria) => sum + criteria.weight, 0);
  //   if (totalWeight !== 100) {
  //     throw new Error(`Total weight of all criteria must be 100%. Current total: ${totalWeight}%`);
  //   }
  // }
  next();
});

// Add pagination plugin
evaluationFormSchema.plugin(mongoosePaginate);

const EvaluationForm = mongoose.model('EvaluationForm', evaluationFormSchema);

export default EvaluationForm;