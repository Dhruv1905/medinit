import { Request, Response } from "express";
import Emergency, { EmergencyStatus } from "../models/Emergency";
import User, { Role } from "../models/User";
import { AuthRequest } from "../middlewares/auth.middleware";
import { emitToRole, emitToUser } from "../services/socket.service";
// Report emergency (anyone can report)
export const reportEmergency = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { severity, description, location } = req.body;

    if (!severity || !description || !location) {
      res.status(400).json({ message: "Severity, description, and location are required" });
      return;
    }

    const emergency = await Emergency.create({
      patient: req.user!.id,
      reportedBy: req.user!.id,
      severity,
      description,
      location,
      actions: [
        {
          action: "Emergency reported",
          performedBy: req.user!.id,
          timestamp: new Date(),
        },
      ],
    });

    const populated = await emergency.populate([
      { path: "patient", select: "name email instituteId phone" },
      { path: "reportedBy", select: "name" },
    ]);

    res.status(201).json({ message: "Emergency reported", emergency: populated });
    emitToRole("doctor", "emergency-update");
    emitToRole("nurse", "emergency-update");
    emitToRole("admin", "emergency-update");
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all active emergencies (doctor, nurse, admin)
export const getActiveEmergencies = async (_req: Request, res: Response): Promise<void> => {
  try {
    const emergencies = await Emergency.find({
      status: { $nin: [EmergencyStatus.RESOLVED] },
    })
      .populate("patient", "name email instituteId phone bloodGroup allergies")
      .populate("reportedBy", "name")
      .populate("assignedDoctor", "name")
      .populate("assignedNurse", "name")
      .populate("actions.performedBy", "name")
      .sort({ severity: 1, createdAt: 1 });

    res.json({ emergencies });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all emergencies including resolved (admin)
export const getAllEmergencies = async (_req: Request, res: Response): Promise<void> => {
  try {
    const emergencies = await Emergency.find()
      .populate("patient", "name email instituteId")
      .populate("assignedDoctor", "name")
      .populate("assignedNurse", "name")
      .sort({ createdAt: -1 });

    res.json({ emergencies });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get my emergencies (patient)
export const getMyEmergencies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const emergencies = await Emergency.find({ patient: req.user!.id })
      .populate("assignedDoctor", "name")
      .populate("assignedNurse", "name")
      .sort({ createdAt: -1 });

    res.json({ emergencies });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update emergency (doctor, nurse, admin)
export const updateEmergency = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, assignedDoctor, assignedNurse, vitals, diagnosis, treatment, referralNotes, actionNote } = req.body;

    const emergency = await Emergency.findById(id);
    if (!emergency) {
      res.status(404).json({ message: "Emergency not found" });
      return;
    }

    if (status) emergency.status = status;
    if (assignedDoctor) emergency.assignedDoctor = assignedDoctor;
    if (assignedNurse) emergency.assignedNurse = assignedNurse;
    if (vitals) emergency.vitals = { ...emergency.vitals, ...vitals };
    if (diagnosis) emergency.diagnosis = diagnosis;
    if (treatment) emergency.treatment = treatment;
    if (referralNotes) emergency.referralNotes = referralNotes;

    if (status === EmergencyStatus.RESOLVED) {
      emergency.resolvedAt = new Date();
    }

    if (actionNote) {
      emergency.actions.push({
        action: actionNote,
        performedBy: req.user!.id as any,
        timestamp: new Date(),
      });
    }

    await emergency.save();

    const populated = await emergency.populate([
      { path: "patient", select: "name email instituteId phone bloodGroup allergies" },
      { path: "assignedDoctor", select: "name" },
      { path: "assignedNurse", select: "name" },
      { path: "actions.performedBy", select: "name" },
    ]);

    res.json({ message: "Emergency updated", emergency: populated });
    emitToRole("doctor", "emergency-update");
    emitToRole("nurse", "emergency-update");
    emitToRole("admin", "emergency-update");
    emitToUser(emergency.patient.toString(), "emergency-update");
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};