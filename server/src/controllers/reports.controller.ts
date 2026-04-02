import { Request, Response } from "express";
import Appointment from "../models/Appointment";
import User from "../models/User";
import Emergency from "../models/Emergency";
import Medicine from "../models/Medicine";
import Certificate from "../models/Certificate";

export const getDashboardReport = async (_req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

    // User stats
    const totalUsers = await User.countDocuments({ isActive: true });
    const usersByRole = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Appointment stats
    const todayAppointments = await Appointment.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: { $nin: ["cancelled"] },
    });

    const thisMonthAppointments = await Appointment.countDocuments({
      date: { $gte: thisMonthStart },
      status: { $nin: ["cancelled"] },
    });

    const lastMonthAppointments = await Appointment.countDocuments({
      date: { $gte: lastMonthStart, $lte: lastMonthEnd },
      status: { $nin: ["cancelled"] },
    });

    const completedToday = await Appointment.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: "completed",
    });

    // Appointments by status
    const appointmentsByStatus = await Appointment.aggregate([
      { $match: { date: { $gte: thisMonthStart } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Weekly trend (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const count = await Appointment.countDocuments({
        date: { $gte: dayStart, $lt: dayEnd },
        status: { $nin: ["cancelled"] },
      });

      weeklyTrend.push({
        date: dayStart.toISOString().split("T")[0],
        day: dayStart.toLocaleDateString("en-IN", { weekday: "short" }),
        count,
      });
    }

    // Top reasons
    const topReasons = await Appointment.aggregate([
      { $match: { date: { $gte: thisMonthStart } } },
      { $group: { _id: "$reason", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Emergency stats
    const activeEmergencies = await Emergency.countDocuments({
      status: { $nin: ["resolved"] },
    });

    const totalEmergencies = await Emergency.countDocuments({
      createdAt: { $gte: thisMonthStart },
    });

    // Medicine stats
    const lowStockMedicines = await Medicine.countDocuments({
      isActive: true,
      $expr: { $lte: ["$quantity", "$reorderLevel"] },
    });

    const expiredMedicines = await Medicine.countDocuments({
      isActive: true,
      expiryDate: { $lt: new Date() },
    });

    // Certificate stats
    const pendingCertificates = await Certificate.countDocuments({ status: "requested" });
    const issuedCertificates = await Certificate.countDocuments({
      status: "approved",
      createdAt: { $gte: thisMonthStart },
    });

    // Doctor workload
    const doctorWorkload = await Appointment.aggregate([
      { $match: { date: { $gte: thisMonthStart }, status: { $nin: ["cancelled"] } } },
      { $group: { _id: "$doctor", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      { $unwind: "$doctorInfo" },
      {
        $project: {
          name: "$doctorInfo.name",
          count: 1,
        },
      },
    ]);

    res.json({
      report: {
        users: {
          total: totalUsers,
          byRole: Object.fromEntries(usersByRole.map((r) => [r._id, r.count])),
        },
        appointments: {
          today: todayAppointments,
          completedToday,
          thisMonth: thisMonthAppointments,
          lastMonth: lastMonthAppointments,
          byStatus: Object.fromEntries(appointmentsByStatus.map((s) => [s._id, s.count])),
          weeklyTrend,
          topReasons,
        },
        emergencies: {
          active: activeEmergencies,
          thisMonth: totalEmergencies,
        },
        medicines: {
          lowStock: lowStockMedicines,
          expired: expiredMedicines,
        },
        certificates: {
          pending: pendingCertificates,
          issuedThisMonth: issuedCertificates,
        },
        doctorWorkload,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};