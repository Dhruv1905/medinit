import { Router } from "express";
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

router.post("/", protect, authorize("admin"), createUser);
router.get("/", protect, authorize("admin"), getAllUsers);
router.get("/stats", protect, authorize("admin"), getUserStats);
router.patch("/:id/role", protect, authorize("admin"), updateUserRole);
router.patch("/:id/toggle-status", protect, authorize("admin"), toggleUserStatus);
router.delete("/:id", protect, authorize("admin"), deleteUser);

export default router;