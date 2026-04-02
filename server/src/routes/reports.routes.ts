import { Router } from "express";
import { getDashboardReport } from "../controllers/reports.controller";
import { protect, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.get("/dashboard", protect, authorize("admin"), getDashboardReport);

export default router;