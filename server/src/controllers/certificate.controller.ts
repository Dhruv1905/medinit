import { Request, Response } from "express";
import Certificate, { CertificateStatus } from "../models/Certificate";
import User, { Role } from "../models/User";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  requestCertificateSchema,
  processCertificateSchema,
} from "../validators/certificate.validator";
import { emitToRole, emitToUser } from "../services/socket.service";
import { generateCertificatePDF } from "../services/certificate.service";
// Request a certificate (patient)
export const requestCertificate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = requestCertificateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error?.format() });
      return;
    }

    const { doctor, type, reason, startDate, endDate, appointment } = parsed.data;

    const doctorUser = await User.findOne({ _id: doctor, role: Role.DOCTOR, isActive: true });
    if (!doctorUser) {
      res.status(404).json({ message: "Doctor not found" });
      return;
    }

    const certificate = await Certificate.create({
      patient: req.user!.id,
      doctor,
      type,
      reason,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      appointment: appointment || undefined,
    });

    const populated = await certificate.populate([
      { path: "doctor", select: "name email" },
      { path: "patient", select: "name email instituteId" },
    ]);

    res.status(201).json({ message: "Certificate requested", certificate: populated });
    emitToRole("doctor", "certificate-update");
    emitToUser(doctor, "certificate-update");
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get my certificates (patient)
export const getMyCertificates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const certificates = await Certificate.find({ patient: req.user!.id })
      .populate("doctor", "name email")
      .sort({ createdAt: -1 });

    res.json({ certificates });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get pending certificates for doctor
export const getDoctorCertificates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter: any = { doctor: req.user!.id };
    if (status) filter.status = status;

    const certificates = await Certificate.find(filter)
      .populate("patient", "name email instituteId phone bloodGroup")
      .populate("appointment", "date timeSlot reason diagnosis")
      .sort({ createdAt: -1 });

    res.json({ certificates });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Process certificate (doctor — approve/reject)
export const processCertificate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parsed = processCertificateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error?.format() });
      return;
    }

    const certificate = await Certificate.findOne({ _id: id, doctor: req.user!.id });
    if (!certificate) {
      res.status(404).json({ message: "Certificate not found" });
      return;
    }

    if (certificate.status !== CertificateStatus.REQUESTED) {
      res.status(400).json({ message: "Certificate has already been processed" });
      return;
    }

    const { status, diagnosis, remarks, rejectionReason } = parsed.data;

    certificate.status = status as CertificateStatus;

    if (status === "approved") {
      certificate.issuedAt = new Date();
      if (diagnosis) certificate.diagnosis = diagnosis;
      if (remarks) certificate.remarks = remarks;
    } else {
      certificate.rejectionReason = rejectionReason || "Rejected by doctor";
    }

    await certificate.save();

    const populated = await certificate.populate([
      { path: "patient", select: "name email instituteId" },
      { path: "doctor", select: "name email" },
    ]);

    res.json({ message: `Certificate ${status}`, certificate: populated });
    emitToRole("admin", "certificate-update");
    emitToUser(certificate.patient.toString(), "certificate-update");
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all certificates (admin)
export const getAllCertificates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, type } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const certificates = await Certificate.find(filter)
      .populate("patient", "name email instituteId")
      .populate("doctor", "name email")
      .sort({ createdAt: -1 });

    res.json({ certificates });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Verify certificate by code (public)
export const verifyCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;

    const certificate = await Certificate.findOne({ verificationCode: code })
      .populate("patient", "name instituteId")
      .populate("doctor", "name");

    if (!certificate) {
      res.status(404).json({ message: "Certificate not found", valid: false });
      return;
    }

    res.json({
      valid: certificate.status === CertificateStatus.APPROVED,
      certificate: {
        type: certificate.type,
        status: certificate.status,
        patientName: (certificate.patient as any).name,
        patientId: (certificate.patient as any).instituteId,
        doctorName: (certificate.doctor as any).name,
        startDate: certificate.startDate,
        endDate: certificate.endDate,
        issuedAt: certificate.issuedAt,
        verificationCode: certificate.verificationCode,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Revoke certificate (admin)
export const revokeCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findByIdAndUpdate(
      id,
      {
        status: CertificateStatus.REVOKED,
        revokedAt: new Date(),
      },
      { returnDocument: "after" }
    )
      .populate("patient", "name email instituteId")
      .populate("doctor", "name email");

    if (!certificate) {
      res.status(404).json({ message: "Certificate not found" });
      return;
    }

    res.json({ message: "Certificate revoked", certificate });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Download certificate PDF
export const downloadCertificate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findOne({
      _id: id,
      status: "approved",
    })
      .populate("patient", "name email instituteId")
      .populate("doctor", "name email");

    if (!certificate) {
      res.status(404).json({ message: "Approved certificate not found" });
      return;
    }

    // Check if requester is the patient or admin
    const userId = req.user!.id;
    const isPatient = certificate.patient._id.toString() === userId;
    const isAdmin = req.user!.role === "admin";

    if (!isPatient && !isAdmin) {
      res.status(403).json({ message: "Not authorized to download this certificate" });
      return;
    }

    await generateCertificatePDF(certificate, res);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};