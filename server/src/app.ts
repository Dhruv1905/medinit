import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import appointmentRoutes from "./routes/appointment.routes";
import medicineRoutes from "./routes/medicine.routes";
import certificateRoutes from "./routes/certificate.routes";
import userRoutes from "./routes/user.routes";
import emergencyRoutes from "./routes/emergency.routes";
import reportsRoutes from "./routes/reports.routes";
import reimbursementRoutes from "./routes/reimbursement.routes";
import contactRoutes from "./routes/contact.routes";
import path from "path";

const app = express();

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"], credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/users", userRoutes);
app.use("/api/emergencies", emergencyRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/reimbursements", reimbursementRoutes);
app.use("/api/contact", contactRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "MediNIT server is running" });
});

export default app;