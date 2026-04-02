import { Router } from "express";
import {
  getAvailableSlots,
  getDoctors,
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  updateVitals,
  cancelAppointment,
  getVisitHistory,
  getPrescriptions,
  fulfillPrescription,
} from "../controllers/appointment.controller";
import { protect, authorize } from "../middlewares/auth.middleware";

const router = Router();

// Public-ish (needs auth)
router.get("/doctors", protect, getDoctors);
router.get("/slots", protect, getAvailableSlots);

// Patient routes
router.post("/", protect, authorize("student", "faculty"), createAppointment);
router.get("/my", protect, authorize("student", "faculty"), getMyAppointments);
router.patch("/:id/cancel", protect, authorize("student", "faculty"), cancelAppointment);
router.get("/history", protect, authorize("student", "faculty"), getVisitHistory);
// Doctor routes
router.get("/doctor", protect, authorize("doctor"), getDoctorAppointments);
router.patch("/:id/status", protect, authorize("doctor", "admin"), updateAppointmentStatus);

// Nurse routes
router.patch("/:id/vitals", protect, authorize("nurse"), updateVitals);

// Admin routes
router.get("/all", protect, authorize("admin", "nurse"), getAllAppointments);
router.get("/prescriptions", protect, authorize("pharmacist", "admin"), getPrescriptions);
router.patch("/:id/fulfill", protect, authorize("pharmacist", "admin"), fulfillPrescription);
export default router;