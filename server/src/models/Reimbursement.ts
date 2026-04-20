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
    upiId: string;
    phone: string;
    bankDetails: {
        accountNo: string;
        ifsc: string;
        bankName: string;
    };
    paymentDetails?: {
        razorpayPaymentLinkId?: string;
        razorpayPaymentId?: string;
        utrNumber?: string;
        paidAt?: Date;
        method?: string;
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
        upiId: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        bankDetails: {
            accountNo: { type: String, required: true },
            ifsc: { type: String, required: true },
            bankName: { type: String, required: true },
        },
        paymentDetails: {
            razorpayPaymentLinkId: { type: String },
            razorpayPaymentId: { type: String },
            utrNumber: { type: String },
            paidAt: { type: Date },
            method: { type: String },
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
