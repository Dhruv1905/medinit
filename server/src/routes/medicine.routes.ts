import { Router } from "express";
import {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  updateStock,
  deleteMedicine,
  getInventoryStats,
} from "../controllers/medicine.controller";
import { protect, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", protect, authorize("pharmacist", "admin", "doctor"), getAllMedicines);
router.get("/stats", protect, authorize("pharmacist", "admin"), getInventoryStats);
router.get("/:id", protect, authorize("pharmacist", "admin", "doctor"), getMedicineById);
router.post("/", protect, authorize("pharmacist", "admin"), createMedicine);
router.put("/:id", protect, authorize("pharmacist", "admin"), updateMedicine);
router.patch("/:id/stock", protect, authorize("pharmacist", "admin"), updateStock);
router.delete("/:id", protect, authorize("admin"), deleteMedicine);

export default router;