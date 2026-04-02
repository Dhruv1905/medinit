import mongoose, { Schema, Document } from "mongoose";

export enum EmergencySeverity {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
}

export enum EmergencyStatus {
  REPORTED = "reported",
  RESPONDING = "responding",
  IN_TREATMENT = "in_treatment",
  REFERRED = "referred",
  RESOLVED = "resolved",
}

export interface IEmergency extends Document {
  patient: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  assignedDoctor?: mongoose.Types.ObjectId;
  assignedNurse?: mongoose.Types.ObjectId;
  severity: EmergencySeverity;
  status: EmergencyStatus;
  description: string;
  location: string;
  vitals?: {
    bloodPressure?: string;
    temperature?: number;
    pulse?: number;
    spo2?: number;
  };
  actions: {
    action: string;
    performedBy: mongoose.Types.ObjectId;
    timestamp: Date;
  }[];
  diagnosis?: string;
  treatment?: string;
  referralNotes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const emergencySchema = new Schema<IEmergency>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient is required"],
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedDoctor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    assignedNurse: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    severity: {
      type: String,
      enum: Object.values(EmergencySeverity),
      required: [true, "Severity is required"],
    },
    status: {
      type: String,
      enum: Object.values(EmergencyStatus),
      default: EmergencyStatus.REPORTED,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    vitals: {
      bloodPressure: { type: String },
      temperature: { type: Number },
      pulse: { type: Number },
      spo2: { type: Number },
    },
    actions: [
      {
        action: { type: String, required: true },
        performedBy: { type: Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    diagnosis: { type: String },
    treatment: { type: String },
    referralNotes: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

emergencySchema.index({ status: 1, severity: 1 });
emergencySchema.index({ patient: 1, createdAt: -1 });

export default mongoose.model<IEmergency>("Emergency", emergencySchema);