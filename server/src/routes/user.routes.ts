import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  createUser,
  getAllUsers,
  getUserStats,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} from "../controllers/user.controller";
import { protect, authorize } from "../middlewares/auth.middleware";

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
  limits: { fileSize: 5 * 1024 * 1024 },
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

router.post("/", protect, authorize("admin"), upload.single("profilePicture"), createUser);
router.get("/", protect, authorize("admin"), getAllUsers);
router.get("/stats", protect, authorize("admin"), getUserStats);
router.patch("/:id/role", protect, authorize("admin"), updateUserRole);
router.patch("/:id/toggle-status", protect, authorize("admin"), toggleUserStatus);
router.delete("/:id", protect, authorize("admin"), deleteUser);

export default router;