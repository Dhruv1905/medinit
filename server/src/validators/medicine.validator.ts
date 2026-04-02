import { z } from "zod";

export const createMedicineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  genericName: z.string().min(1, "Generic name is required"),
  category: z.enum(["tablet", "capsule", "syrup", "injection", "ointment", "drops", "inhaler", "other"]),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  batchNumber: z.string().min(1, "Batch number is required"),
  quantity: z.number().min(0, "Quantity must be 0 or more"),
  unitPrice: z.number().min(0, "Price must be 0 or more"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  reorderLevel: z.number().min(0).optional(),
  description: z.string().optional(),
  sideEffects: z.string().optional(),
});

export const updateMedicineSchema = createMedicineSchema.partial();

export const updateStockSchema = z.object({
  quantity: z.number().min(0, "Quantity must be 0 or more"),
});