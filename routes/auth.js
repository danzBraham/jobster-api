import express from "express";
const router = express.Router();
import auth from "../middleware/authentication.js";

import { register, login, updateUser } from "../controllers/auth.js";

router.post("/register", register);
router.post("/login", login);
router.patch("/updateUser", auth, updateUser);

export default router;
