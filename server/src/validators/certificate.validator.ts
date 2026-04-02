import { z } from "zod";

export const requestCertificateSchema = z.object({
  doctor: z.string().min(1, "Doctor is required"),
  type: z.enum(["sick_leave", "fitness", "medical_report", "vaccination", "other"]),
  reason: z.string().min(3, "Reason must be at least 3 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  appointment: z.string().optional(),
});

export const processCertificateSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  diagnosis: z.string().optional(),
  remarks: z.string().optional(),
  rejectionReason: z.string().optional(),
});