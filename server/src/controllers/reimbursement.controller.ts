import { Request, Response } from "express";
import Reimbursement from "../models/Reimbursement";
import Appointment from "../models/Appointment";
import { AuthRequest } from "../middlewares/auth.middleware";
import razorpay from "../config/razorpay";

export const createReimbursement = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { appointment, amount, bankDetails, externalHospitalName, upiId, phone } = req.body;
        const documentUrl = req.file ? `/uploads/${req.file.filename}` : "";

        if (!appointment || !amount || !bankDetails || !documentUrl || !upiId || !phone) {
            res.status(400).json({ message: "Missing required fields or file" });
            return;
        }

        const newReimbursement = await Reimbursement.create({
            student: req.user!.id,
            appointment,
            amount,
            documentUrl,
            bankDetails: JSON.parse(bankDetails),
            externalHospitalName,
            upiId,
            phone,
        });

        await Appointment.findByIdAndUpdate(appointment, { reimbursementRequested: true });

        res.status(201).json({ message: "Reimbursement submitted successfully", reimbursement: newReimbursement });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const getMyReimbursements = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const reimbursements = await Reimbursement.find({ student: req.user!.id })
            .populate("appointment", "date reason doctor")
            .sort({ createdAt: -1 });
        res.json({ reimbursements });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const getAllReimbursements = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const reimbursements = await Reimbursement.find()
            .populate("student", "name instituteId email")
            .populate("appointment", "date reason doctor")
            .sort({ createdAt: -1 });

        res.json({ reimbursements });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const updateReimbursementStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const reimbursement = await Reimbursement.findByIdAndUpdate(
            id,
            { status },
            { returnDocument: "after" }
        );

        if (!reimbursement) {
            res.status(404).json({ message: "Reimbursement not found" });
            return;
        }

        res.json({ message: "Status updated successfully", reimbursement });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Process UPI payment via Razorpay Payment Link
export const processUPIPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const reimbursement = await Reimbursement.findById(id).populate("student", "name email");
        if (!reimbursement) {
            res.status(404).json({ message: "Reimbursement not found" });
            return;
        }

        if (reimbursement.status !== "verified") {
            res.status(400).json({ message: "Reimbursement must be verified before payment" });
            return;
        }

        // Create a Razorpay Payment Link for UPI payment
        const paymentLink = await razorpay.paymentLink.create({
            amount: Math.round(reimbursement.amount * 100), // amount in paise
            currency: "INR",
            accept_partial: false,
            description: `Reimbursement for ${reimbursement.externalHospitalName}`,
            customer: {
                name: (reimbursement.student as any).name || "Student",
                email: (reimbursement.student as any).email || "",
                contact: reimbursement.phone,
            },
            notify: {
                sms: true,
                email: true,
            },
            reminder_enable: false,
            notes: {
                reimbursement_id: reimbursement._id.toString(),
                student_upi: reimbursement.upiId,
                purpose: "Medical Reimbursement",
            },
            callback_url: `http://localhost:5173/dashboard`,
            callback_method: "get",
        });

        // Update reimbursement with payment link details and mark as reimbursed
        reimbursement.paymentDetails = {
            razorpayPaymentLinkId: paymentLink.id,
            method: "upi",
            paidAt: new Date(),
        };
        reimbursement.status = "reimbursed" as any;
        await reimbursement.save();

        res.json({
            message: "UPI payment initiated successfully",
            paymentLink: paymentLink.short_url,
            paymentLinkId: paymentLink.id,
            reimbursement,
        });
    } catch (error: any) {
        console.error("Razorpay payment error:", error);
        res.status(500).json({
            message: "Payment processing failed",
            error: error?.error?.description || error?.message || "Unknown error",
        });
    }
};
