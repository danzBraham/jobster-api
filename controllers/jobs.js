import Job from "../models/Job.js";
import mongoose from "mongoose";
import moment from "moment";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/index.js";

export const createJob = async (req, res) => {
  if (!req.body.company || !req.body.position) {
    throw new BadRequestError("Please provide company and position");
  }

  req.body.createdBy = req.user.userID;
  const job = await Job.create(req.body);

  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: {
      job,
    },
  });
};

export const getAllJobs = async (req, res) => {
  const { search, status, jobType, sort } = req.query;
  const createdBy = req.user.userID;
  const query = { createdBy };

  if (search) {
    query.position = { $regex: search, $options: "i" };
  }
  if (status && status !== "all") {
    query.status = status;
  }
  if (jobType && jobType !== "all") {
    query.jobType = jobType;
  }

  let result = Job.find(query);

  if (sort === "latest") {
    result = result.sort("-createdAt");
  }
  if (sort === "oldest") {
    result = result.sort("createdAt");
  }
  if (sort === "a-z") {
    result = result.sort("position");
  }
  if (sort === "z-a") {
    result = result.sort("-position");
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  result.skip(skip).limit(limit);

  const jobs = await result;
  const totalJobs = await Job.countDocuments(query);
  const numberOfPages = Math.ceil(totalJobs / limit);

  if (totalJobs === 0) {
    throw new NotFoundError("The Jobs does not exist!");
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    data: {
      jobs,
      totalJobs,
      page,
      numberOfPages,
    },
  });
};

export const getJob = async (req, res) => {
  const {
    user: { userID },
    params: { id: jobID },
  } = req;
  const job = await Job.findOne({ _id: jobID, createdBy: userID });

  if (!job) {
    throw new NotFoundError(`No job with ID ${jobID}`);
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    data: {
      job,
    },
  });
};

export const updateJob = async (req, res) => {
  const {
    user: { userID },
    params: { id: jobID },
    body: { company, position },
  } = req;

  if (!company || !position) {
    throw new BadRequestError("Company and Position cannot be empty");
  }

  const job = await Job.findOneAndUpdate({ _id: jobID, createdBy: userID }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!job) {
    throw new NotFoundError(`No job with ID ${jobID}`);
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    data: {
      job,
    },
  });
};

export const deleteJob = async (req, res) => {
  const {
    user: { userID },
    params: { id: jobID },
  } = req;
  const job = await Job.findOneAndDelete({ _id: jobID, createdBy: userID });

  if (!job) {
    throw new NotFoundError(`No job with ID ${jobID}`);
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    data: {
      job,
    },
  });
};

export const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userID) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
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
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userID) } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
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
        .format("MMM Y");
      return { date, count };
    })
    .reverse();

  res.status(StatusCodes.OK).json({
    status: "success",
    data: {
      defaultStats,
      monthlyApplications,
    },
  });
};
