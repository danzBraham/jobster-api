import Job from "../models/Job.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/index.js";

export const getAllJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user.userID }).sort("createdAt");
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
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
  res.status(StatusCodes.OK).json({ job });
};

export const createJob = async (req, res) => {
  if (!req.body.company || !req.body.position) {
    throw new BadRequestError("Please provide company and position");
  }
  req.body.createdBy = req.user.userID;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
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
  const job = await Job.findOneAndUpdate(
    { _id: jobID, createdBy: userID },
    req.body,
    { new: true, runValidators: true }
  );
  if (!job) {
    throw new NotFoundError(`No job with ID ${jobID}`);
  }
  res.status(StatusCodes.OK).json({ job });
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
  res.status(StatusCodes.OK).json({ job });
};
