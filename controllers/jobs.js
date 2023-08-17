import Job from '../models/Job.js';
import mongoose from 'mongoose';
import moment from 'moment';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors/index.js';

export const createJob = async (req, res) => {
  const {
    user: { userId },
    body: { company, position, jobType, jobLocation },
  } = req;

  if (!company || !position || !jobType || !jobLocation) {
    throw new BadRequestError(
      'Please provide company, position, job type, and job location'
    );
  }

  const job = await Job.create({
    ...req.body,
    createdBy: userId,
  });

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    data: {
      job,
    },
  });
};

export const getAllJobs = async (req, res) => {
  const {
    query: { search, status, jobType, sort },
    user: { userId: createdBy },
  } = req;

  const query = { createdBy };
  if (search) query.position = { $regex: search, $options: 'i' };
  if (status && status !== 'all') query.status = status;
  if (jobType && jobType !== 'all') query.jobType = jobType;

  let result = Job.find(query);

  switch (sort) {
    case 'latest':
      result = result.sort('-createdAt');
      break;
    case 'oldest':
      result = result.sort('createdAt');
      break;
    case 'a-z':
      result = result.sort('position');
      break;
    case 'z-a':
      result = result.sort('-position');
      break;
    default:
      result = result.sort('-createdAt');
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  result.skip(skip).limit(limit);

  const jobs = await result;
  const totalJobs = await Job.countDocuments(query);
  const numberOfPages = Math.ceil(totalJobs / limit);

  if (totalJobs === 0) {
    throw new NotFoundError('The Jobs does not exist!');
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      totalJobs,
      page,
      numberOfPages,
      jobs,
    },
  });
};

export const getJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;
  const job = await Job.findOne({ _id: jobId, createdBy: userId });

  if (!job) {
    throw new NotFoundError(`No job with ID ${jobId}`);
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      job,
    },
  });
};

export const updateJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
    body: { company, position },
  } = req;

  if (!company || !position) {
    throw new BadRequestError('Company and Position cannot be empty');
  }

  const job = await Job.findOneAndUpdate(
    { _id: jobId, createdBy: userId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!job) {
    throw new NotFoundError(`No job with ID ${jobId}`);
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      job,
    },
  });
};

export const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;
  const job = await Job.findOneAndDelete({ _id: jobId, createdBy: userId });

  if (!job) {
    throw new NotFoundError(`No job with ID ${jobId}`);
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      job,
    },
  });
};

export const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format('MMM Y');
      return { date, count };
    })
    .reverse();

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      defaultStats,
      monthlyApplications,
    },
  });
};
