import { Request, Response } from "express";
import mongoose from "mongoose";
import Appointment, { AppointmentStatus } from "../models/Appointment";
import User, { Role } from "../models/User";
import Medicine from "../models/Medicine";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  createAppointmentSchema,
  updateStatusSchema,
  updateVitalsSchema,
} from "../validators/appointment.validator";
import { emitToRole, emitToUser } from "../services/socket.service";
// Get available time slots for a doctor on a given date
export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      res.status(400).json({ message: "doctorId and date are required" });
      return;
    }

    const allSlots = [
      "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
      "11:00 AM", "11:30 AM", "12:00 PM",
      "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
      "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
      "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM"
    ];

    const dayStart = new Date(date as string);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date as string);
    dayEnd.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $nin: [AppointmentStatus.CANCELLED] },
    }).select("timeSlot");

    const bookedSlots = bookedAppointments.map((a) => a.timeSlot);
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    res.json({ slots: availableSlots, bookedSlots });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all doctors
export const getDoctors = async (_req: Request, res: Response): Promise<void> => {
  try {
    const doctors = await User.find({ role: Role.DOCTOR, isActive: true }).select(
      "name email instituteId"
    );
    res.json({ doctors });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Book an appointment (patient)
export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = createAppointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error?.format() });
      return;
    }

    const { doctor, date, timeSlot, reason, priority } = parsed.data;

    // Check doctor exists and is a doctor
    const doctorUser = await User.findOne({ _id: doctor, role: Role.DOCTOR, isActive: true });
    if (!doctorUser) {
      res.status(404).json({ message: "Doctor not found" });
      return;
    }

    // Check slot availability
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const existing = await Appointment.findOne({
      doctor,
      date: { $gte: dayStart, $lte: dayEnd },
      timeSlot,
      status: { $nin: [AppointmentStatus.CANCELLED] },
    });

    if (existing) {
      res.status(409).json({ message: "This time slot is already booked" });
      return;
    }

    // Generate queue number for the day
    const dayAppointments = await Appointment.countDocuments({
      doctor,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $nin: [AppointmentStatus.CANCELLED] },
    });

    const appointment = await Appointment.create({
      patient: req.user!.id,
      doctor,
      date: dayStart,
      timeSlot,
      reason,
      priority: priority || "normal",
      queueNumber: dayAppointments + 1,
    });

    const populated = await appointment.populate([
      { path: "doctor", select: "name email" },
      { path: "patient", select: "name email instituteId" },
    ]);

    res.status(201).json({ message: "Appointment booked successfully", appointment: populated });
    // Notify doctor and nurses
    emitToRole("doctor", "appointment-update");
    emitToRole("nurse", "appointment-update");
    emitToRole("admin", "appointment-update");
    emitToUser(doctor, "appointment-update");
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get my appointments (patient)
export const getMyAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointments = await Appointment.find({ patient: req.user!.id })
      .populate("doctor", "name email")
      .sort({ date: -1, timeSlot: 1 });

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get doctor's appointments (doctor)
export const getDoctorAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date } = req.query;

    const filter: any = { doctor: req.user!.id };

    if (date) {
      const dayStart = new Date(date as string);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date as string);
      dayEnd.setHours(23, 59, 59, 999);
      filter.date = { $gte: dayStart, $lte: dayEnd };
    }

    const appointments = await Appointment.find(filter)
      .populate("patient", "name email instituteId phone bloodGroup allergies")
      .sort({ queueNumber: 1 });

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all appointments (admin)
export const getAllAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, status } = req.query;
    const filter: any = {};

    if (date) {
      const dayStart = new Date(date as string);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date as string);
      dayEnd.setHours(23, 59, 59, 999);
      filter.date = { $gte: dayStart, $lte: dayEnd };
    }

    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate("patient", "name email instituteId")
      .populate("doctor", "name email")
      .sort({ date: -1, timeSlot: 1 });

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error?.format() });
      return;
    }

    const update: any = { status: parsed.data.status };

    if (parsed.data.status === AppointmentStatus.COMPLETED) {
      update.completedAt = new Date();
      if (parsed.data.diagnosis) update.diagnosis = parsed.data.diagnosis;
      if (parsed.data.prescription) update.prescription = parsed.data.prescription;
      if (parsed.data.prescriptionItems) update.prescriptionItems = parsed.data.prescriptionItems;
      if (parsed.data.isExternalReference !== undefined) update.isExternalReference = parsed.data.isExternalReference;
      if (parsed.data.externalHospitalName) update.externalHospitalName = parsed.data.externalHospitalName;
    }

    if (parsed.data.status === AppointmentStatus.CANCELLED) {
      update.cancelledAt = new Date();
      if (parsed.data.cancelReason) update.cancelReason = parsed.data.cancelReason;
    }

    if (parsed.data.notes) update.notes = parsed.data.notes;

    const appointment = await Appointment.findByIdAndUpdate(id, update, { returnDocument: "after" })
      .populate("patient", "name email instituteId")
      .populate("doctor", "name email");

    if (!appointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }

    res.json({ message: "Appointment updated", appointment });
    // Notify relevant parties
    emitToRole("doctor", "appointment-update");
    emitToRole("nurse", "appointment-update");
    emitToRole("admin", "appointment-update");
    emitToRole("pharmacist", "prescription-update");
    if (appointment.patient) {
      emitToUser(appointment.patient._id.toString(), "appointment-update");
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update vitals (nurse)
export const updateVitals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parsed = updateVitalsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error?.format() });
      return;
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { vitals: parsed.data },
      { returnDocument: "after" }
    )
      .populate("patient", "name email instituteId")
      .populate("doctor", "name email");

    if (!appointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }

    res.json({ message: "Vitals updated", appointment });
    emitToRole("doctor", "appointment-update");
    emitToRole("nurse", "appointment-update");
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Cancel appointment (patient)
export const cancelAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findOne({
      _id: id,
      patient: req.user!.id,
      status: AppointmentStatus.SCHEDULED,
    });

    if (!appointment) {
      res.status(404).json({ message: "Appointment not found or cannot be cancelled" });
      return;
    }

    appointment.status = AppointmentStatus.CANCELLED;
    appointment.cancelledAt = new Date();
    appointment.cancelReason = reason || "Cancelled by patient";
    await appointment.save();

    res.json({ message: "Appointment cancelled", appointment });
    emitToRole("doctor", "appointment-update");
    emitToRole("nurse", "appointment-update");
    emitToRole("admin", "appointment-update");
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// Get visit history (patient)
export const getVisitHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointments = await Appointment.find({
      patient: req.user!.id,
      status: AppointmentStatus.COMPLETED,
    })
      .populate("doctor", "name email")
      .sort({ completedAt: -1 });

    res.json({ visits: appointments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get prescriptions for pharmacist
// Get prescriptions for pharmacist
export const getPrescriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const filter: any = {
      status: "completed",
      $or: [
        { prescription: { $exists: true, $nin: [null, ""] } },
        { "prescriptionItems.0": { $exists: true } }
      ]
    };

    if (status === "pending") {
      filter.$or = [
        { prescriptionFulfilled: { $exists: false } },
        { prescriptionFulfilled: false },
      ];
    } else if (status === "fulfilled") {
      filter.prescriptionFulfilled = true;
    }

    const appointments = await Appointment.find(filter)
      .populate("patient", "name email instituteId phone")
      .populate("doctor", "name email")
      .sort({ completedAt: -1 });

    res.json({ prescriptions: appointments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// Fulfill prescription
export const fulfillPrescription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const existingApt = await Appointment.findById(id);
    if (!existingApt) {
      res.status(404).json({ message: "Prescription not found" });
      return;
    }

    if (existingApt.prescriptionItems && existingApt.prescriptionItems.length > 0) {
      // Validate inventory
      for (const item of existingApt.prescriptionItems) {
        if (item.medicineId) {
          const med = await Medicine.findById(item.medicineId);
          if (!med) {
            res.status(400).json({ message: `Medicine ${item.medicineName} not found in inventory` });
            return;
          }
          if (med.quantity < item.quantity) {
            res.status(400).json({ message: `Insufficient stock for ${item.medicineName}. Available: ${med.quantity}` });
            return;
          }
        }
      }

      // Deduct inventory
      for (const item of existingApt.prescriptionItems) {
        if (item.medicineId) {
          await Medicine.findByIdAndUpdate(item.medicineId, { $inc: { quantity: -item.quantity } });
        }
      }
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        prescriptionFulfilled: true,
        prescriptionFulfilledAt: new Date(),
        pharmacistNotes: notes || "",
      },
      { returnDocument: "after" }
    )
      .populate("patient", "name email instituteId")
      .populate("doctor", "name email");

    if (!appointment) {
      res.status(404).json({ message: "Prescription not found" });
      return;
    }

    res.json({ message: "Prescription fulfilled", prescription: appointment });
    emitToRole("pharmacist", "prescription-update");
    if (appointment.patient) {
      emitToUser(appointment.patient._id.toString(), "prescription-update");
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};