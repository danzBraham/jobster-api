import express from 'express';
const router = express.Router();
import testUser from '../middleware/test-user.js';

import {
  createJob,
  getAllJobs,
  getJob,
  updateJob,
  deleteJob,
  showStats,
} from '../controllers/jobs.js';

router.route('/').get(getAllJobs).post(testUser, createJob);
router.route('/stats').get(showStats);
router
  .route('/:id')
  .get(getJob)
  .patch(testUser, updateJob)
  .delete(testUser, deleteJob);

export default router;
