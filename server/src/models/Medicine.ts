import mongoose, { Schema, Document } from "mongoose";

export enum MedicineCategory {
  TABLET = "tablet",
  CAPSULE = "capsule",
  SYRUP = "syrup",
  INJECTION = "injection",
  OINTMENT = "ointment",
  DROPS = "drops",
  INHALER = "inhaler",
  OTHER = "other",
}

export interface IMedicine extends Document {
  name: string;
  genericName: string;
  category: MedicineCategory;
  manufacturer: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  expiryDate: Date;
  reorderLevel: number;
  description?: string;
  sideEffects?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const medicineSchema = new Schema<IMedicine>(
  {
    name: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
    },
    genericName: {
      type: String,
      required: [true, "Generic name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(MedicineCategory),
      required: [true, "Category is required"],
    },
    manufacturer: {
      type: String,
      required: [true, "Manufacturer is required"],
      trim: true,
    },
    batchNumber: {
      type: String,
      required: [true, "Batch number is required"],
      unique: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: 0,
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    reorderLevel: {
      type: Number,
      default: 50,
      min: 0,
    },
    description: { type: String },
    sideEffects: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

medicineSchema.index({ name: "text", genericName: "text" });

export default mongoose.model<IMedicine>("Medicine", medicineSchema);