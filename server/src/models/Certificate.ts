import mongoose, { Schema, Document } from "mongoose";
import crypto from "crypto";

export enum CertificateType {
  SICK_LEAVE = "sick_leave",
  FITNESS = "fitness",
  MEDICAL_REPORT = "medical_report",
  VACCINATION = "vaccination",
  OTHER = "other",
}

export enum CertificateStatus {
  REQUESTED = "requested",
  APPROVED = "approved",
  REJECTED = "rejected",
  REVOKED = "revoked",
}

export interface ICertificate extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  type: CertificateType;
  status: CertificateStatus;
  reason: string;
  diagnosis?: string;
  startDate: Date;
  endDate: Date;
  remarks?: string;
  rejectionReason?: string;
  verificationCode: string;
  issuedAt?: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<ICertificate>(
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
    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
    type: {
      type: String,
      enum: Object.values(CertificateType),
      required: [true, "Certificate type is required"],
    },
    status: {
      type: String,
      enum: Object.values(CertificateStatus),
      default: CertificateStatus.REQUESTED,
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
    },
    diagnosis: { type: String },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    remarks: { type: String },
    rejectionReason: { type: String },
    verificationCode: {
      type: String,
      unique: true,
    },
    issuedAt: { type: Date },
    revokedAt: { type: Date },
  },
  { timestamps: true }
);

// Generate unique verification code before saving
certificateSchema.pre("save", function () {
  if (!this.verificationCode) {
    this.verificationCode = "MN-" + crypto.randomBytes(4).toString("hex").toUpperCase();
  }
});

certificateSchema.index({ patient: 1, createdAt: -1 });
certificateSchema.index({ doctor: 1, status: 1 });
certificateSchema.index({ verificationCode: 1 });

export default mongoose.model<ICertificate>("Certificate", certificateSchema);