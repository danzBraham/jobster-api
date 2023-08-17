import mongoose from 'mongoose';

const JobSchema = mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Please provide company name'],
      maxLength: 30,
    },
    position: {
      type: String,
      required: [true, 'Please provide position'],
      maxLength: 100,
    },
    status: {
      type: String,
      enum: ['interview', 'declined', 'pending'],
      default: 'pending',
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user'],
    },
    jobType: {
      type: String,
      enum: {
        values: ['full-time', 'part-time', 'remote', 'internship'],
        message: 'Unfortunately, we do not support {VALUE} at this time',
      },
    },
    jobLocation: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Job', JobSchema);
