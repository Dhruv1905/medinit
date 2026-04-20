import { Request, Response } from "express";
import User from "../models/User";
import { adminCreateUserSchema } from "../validators/auth.validator";

// Create user (Admin only)
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = adminCreateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error?.format() });
      return;
    }

    const { email, instituteId } = parsed.data;

    const existingUser = await User.findOne({
      $or: [{ email }, { instituteId }],
    });
    if (existingUser) {
      res.status(409).json({ message: "User with this email or ID already exists" });
      return;
    }

    const userData: any = { ...parsed.data };
    if (req.file) {
      userData.profilePicture = `/uploads/${req.file.filename}`;
    }

    const user = await User.create(userData);

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error: any) {
    console.error("Create user error:", error);
    const message = error.message || "Server error";
    res.status(500).json({ message, error: error.errors || error.message });
  }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, search, status } = req.query;
    const filter: any = {};

    if (role) filter.role = role;
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { instituteId: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get user stats
export const getUserStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const total = await User.countDocuments();
    const active = await User.countDocuments({ isActive: true });
    const byRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const roleStats: Record<string, number> = {};
    byRole.forEach((r) => {
      roleStats[r._id] = r.count;
    });

    res.json({
      stats: {
        total,
        active,
        inactive: total - active,
        byRole: roleStats,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update user role
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["student", "faculty", "doctor", "nurse", "pharmacist", "admin"];
    if (!validRoles.includes(role)) {
      res.status(400).json({ message: "Invalid role" });
      return;
    }

    const user = await User.findByIdAndUpdate(id, { role }, { returnDocument: "after" });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ message: "Role updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: user.isActive ? "User activated" : "User deactivated",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete user permanently
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ message: "User deleted permanently" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};