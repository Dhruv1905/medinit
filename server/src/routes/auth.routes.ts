import { Router } from "express";
import { register, login, logout, getMe, updateProfile, changePassword, forgotPassword, verifyOtp, resetPassword } from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.patch("/change-password", protect, changePassword);

// Forgot password flow (public — no auth needed)
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;