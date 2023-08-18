import express from 'express';
const router = express.Router();

import auth from '../middleware/authentication.js';
import testUser from '../middleware/test-user.js';

import { rateLimit } from 'express-rate-limit';
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 100 requests per `windowMs`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    msg: 'Too many request from this IP, try again after 15 minutes',
  },
});

import { register, login, updateUser } from '../controllers/auth.js';

router.post('/register', apiLimiter, register);
router.post('/login', apiLimiter, login);
router.patch('/updateuser', auth, testUser, updateUser);

export default router;
