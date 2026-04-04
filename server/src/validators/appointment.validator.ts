import { z } from "zod";

export const createAppointmentSchema = z.object({
  doctor: z.string().min(1, "Doctor is required"),
  date: z.string().min(1, "Date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
  reason: z.string().min(3, "Reason must be at least 3 characters"),
  priority: z.enum(["normal", "urgent", "emergency"]).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    "scheduled",
    "in_queue",
    "in_consultation",
    "completed",
    "cancelled",
    "no_show",
  ]),
  cancelReason: z.string().optional(),
  diagnosis: z.string().optional(),
  prescription: z.string().optional(),
  prescriptionItems: z.array(z.object({
    medicineId: z.string().optional(),
    medicineName: z.string(),
    quantity: z.number(),
    dose: z.string(),
    timing: z.string(),
    schedule: z.array(z.string())
  })).optional(),
  notes: z.string().optional(),
  isExternalReference: z.boolean().optional(),
  externalHospitalName: z.string().optional(),
});

export const updateVitalsSchema = z.object({
  bloodPressure: z.string().optional(),
  temperature: z.number().optional(),
  pulse: z.number().optional(),
  weight: z.number().optional(),
  spo2: z.number().optional(),
});