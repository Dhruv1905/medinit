import { Router } from "express";
import { register, login, logout, getMe, updateProfile, changePassword } from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.patch("/change-password", protect, changePassword);

export default router;