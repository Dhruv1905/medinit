import { Router } from "express";
import {
  requestCertificate,
  getMyCertificates,
  getDoctorCertificates,
  processCertificate,
  getAllCertificates,
  verifyCertificate,
  revokeCertificate,
  downloadCertificate,
} from "../controllers/certificate.controller";
import { protect, authorize } from "../middlewares/auth.middleware";

const router = Router();

// Public verification
router.get("/verify/:code", verifyCertificate);

// Patient routes
router.post("/request", protect, authorize("student", "faculty"), requestCertificate);
router.get("/my", protect, authorize("student", "faculty"), getMyCertificates);
router.get("/:id/download", protect, downloadCertificate);
// Doctor routes
router.get("/doctor", protect, authorize("doctor"), getDoctorCertificates);
router.patch("/:id/process", protect, authorize("doctor"), processCertificate);

// Admin routes
router.get("/all", protect, authorize("admin"), getAllCertificates);
router.patch("/:id/revoke", protect, authorize("admin"), revokeCertificate);

export default router;