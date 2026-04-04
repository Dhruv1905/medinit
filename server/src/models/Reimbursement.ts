import mongoose, { Schema, Document } from "mongoose";

export enum ReimbursementStatus {
    PENDING = "pending",
    VERIFIED = "verified",
    REIMBURSED = "reimbursed",
    REJECTED = "rejected",
}

export interface IReimbursement extends Document {
    student: mongoose.Types.ObjectId;
    appointment: mongoose.Types.ObjectId;
    externalHospitalName: string;
    amount: number;
    documentUrl: string;
    bankDetails: {
        accountNo: string;
        ifsc: string;
        bankName: string;
    };
    status: ReimbursementStatus;
    createdAt: Date;
    updatedAt: Date;
}

const reimbursementSchema = new Schema<IReimbursement>(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        appointment: {
            type: Schema.Types.ObjectId,
            ref: "Appointment",
            required: true,
            unique: true, // Only one reimbursement per appointment
        },
        externalHospitalName: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        documentUrl: {
            type: String,
            required: true, // Needs an uploaded invoice/bill
        },
        bankDetails: {
            accountNo: { type: String, required: true },
            ifsc: { type: String, required: true },
            bankName: { type: String, required: true },
        },
        status: {
            type: String,
            enum: Object.values(ReimbursementStatus),
            default: ReimbursementStatus.PENDING,
        },
    },
    { timestamps: true }
);

export default mongoose.model<IReimbursement>("Reimbursement", reimbursementSchema);
