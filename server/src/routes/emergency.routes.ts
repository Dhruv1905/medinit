import { Router } from "express";
import {
  reportEmergency,
  getActiveEmergencies,
  getAllEmergencies,
  getMyEmergencies,
  updateEmergency,
} from "../controllers/emergency.controller";
import { protect, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.post("/report", protect, reportEmergency);
router.get("/my", protect, getMyEmergencies);
router.get("/active", protect, authorize("doctor", "nurse", "admin"), getActiveEmergencies);
router.get("/all", protect, authorize("admin"), getAllEmergencies);
router.patch("/:id", protect, authorize("doctor", "nurse", "admin"), updateEmergency);

export default router;