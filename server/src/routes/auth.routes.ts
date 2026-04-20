import { Router } from "express";
import multer from "multer";
import path from "path";
import { register, login, logout, getMe, updateProfile, changePassword, forgotPassword, verifyOtp, resetPassword, uploadProfilePicture } from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// Multer config for profile pictures
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeValid = allowedTypes.test(file.mimetype);
    if (extValid && mimeValid) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
    }
  },
});

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/profile-picture", protect, upload.single("profilePicture"), uploadProfilePicture);
router.patch("/change-password", protect, changePassword);

// Forgot password flow (public — no auth needed)
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;