import { Request, Response } from "express";
import Reimbursement from "../models/Reimbursement";
import Appointment from "../models/Appointment";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createReimbursement = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { appointment, amount, bankDetails, externalHospitalName } = req.body;
        const documentUrl = req.file ? `/uploads/${req.file.filename}` : "";

        if (!appointment || !amount || !bankDetails || !documentUrl) {
            res.status(400).json({ message: "Missing required fields or file" });
            return;
        }

        const newReimbursement = await Reimbursement.create({
            student: req.user!.id,
            appointment,
            amount,
            documentUrl,
            bankDetails: JSON.parse(bankDetails),
            externalHospitalName
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
