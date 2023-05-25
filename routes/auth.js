import express from "express";
const router = express.Router();

import auth from "../middleware/authentication.js";
import testUser from "../middleware/test-user.js";

import rateLimit from "express-rate-limit";
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: true,
  message: {
    msg: "Too many request from this IP, try again after 15 minutes",
  },
});

import { register, login, updateUser } from "../controllers/auth.js";

router.post("/register", apiLimiter, register);
router.post("/login", apiLimiter, login);
router.patch("/updateUser", auth, testUser, updateUser);

export default router;
