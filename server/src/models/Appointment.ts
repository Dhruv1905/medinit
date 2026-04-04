import mongoose, { Schema, Document } from "mongoose";

export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  IN_QUEUE = "in_queue",
  IN_CONSULTATION = "in_consultation",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show",
}

export enum Priority {
  NORMAL = "normal",
  URGENT = "urgent",
  EMERGENCY = "emergency",
}

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  date: Date;
  timeSlot: string;
  reason: string;
  status: AppointmentStatus;
  priority: Priority;
  notes?: string;
  queueNumber?: number;
  vitals?: {
    bloodPressure?: string;
    temperature?: number;
    pulse?: number;
    weight?: number;
    spo2?: number;
  };
  diagnosis?: string;
  prescription?: string;
  prescriptionItems?: {
    medicineId?: mongoose.Types.ObjectId;
    medicineName: string;
    quantity: number;
    dose: string;
    timing: string;
    schedule: string[];
  }[];
  reimbursementRequested?: boolean;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
  prescriptionFulfilled?: boolean;
  prescriptionFulfilledAt?: Date;
  pharmacistNotes?: string;
  isExternalReference?: boolean;
  externalHospitalName?: string;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient is required"],
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Doctor is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.SCHEDULED,
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.NORMAL,
    },
    notes: { type: String },
    queueNumber: { type: Number },
    vitals: {
      bloodPressure: { type: String },
      temperature: { type: Number },
      pulse: { type: Number },
      weight: { type: Number },
      spo2: { type: Number },
    },
    diagnosis: { type: String },
    prescription: { type: String },
    prescriptionItems: [{
      medicineId: { type: Schema.Types.ObjectId, ref: "Medicine" },
      medicineName: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      dose: { type: String, required: true },
      timing: { type: String, required: true },
      schedule: [{ type: String }],
    }],
    reimbursementRequested: { type: Boolean, default: false },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
    prescriptionFulfilled: { type: Boolean, default: false },
    prescriptionFulfilledAt: { type: Date },
    pharmacistNotes: { type: String },
    isExternalReference: { type: Boolean, default: false },
    externalHospitalName: { type: String },
  },
  { timestamps: true }
);

// Prevent double booking: same doctor, same date, same time slot
appointmentSchema.index({ doctor: 1, date: 1, timeSlot: 1 }, { unique: true });

// Index for fast patient lookups
appointmentSchema.index({ patient: 1, date: -1 });

export default mongoose.model<IAppointment>("Appointment", appointmentSchema);