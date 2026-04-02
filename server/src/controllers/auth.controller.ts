import { Request, Response } from "express";
import User from "../models/User";
import { generateToken } from "../utils/jwt";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import mongoose from "mongoose";
import { AuthRequest } from "../middlewares/auth.middleware";
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error?.format() });
      return;
    }

    const { email, instituteId } = parsed.data;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { instituteId }],
    });
    if (existingUser) {
      res.status(409).json({ message: "User with this email or ID already exists" });
      return;
    }

    // Create user
    const user = await User.create(parsed.data);

    // Generate token
    const token = generateToken((user._id as mongoose.Types.ObjectId).toString(), user.role);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error?.format() });
      return;
    }

    const { email, password } = parsed.data;

    // Find user with password field included
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Check if account is active
    if (!user.isActive) {
      res.status(403).json({ message: "Account is deactivated. Contact admin." });
      return;
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Generate token
   const token = generateToken((user._id as mongoose.Types.ObjectId).toString(), user.role);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out successfully" });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// Update profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, bloodGroup, allergies } = req.body;

    const user = await User.findByIdAndUpdate(
      (req as any).user.id,
      { name, phone, bloodGroup, allergies },
      { returnDocument: "after" }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      message: "Profile updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        allergies: user.allergies,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Change password
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: "Both current and new passwords are required" });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: "New password must be at least 6 characters" });
      return;
    }

    const user = await User.findById((req as any).user.id).select("+password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ message: "Current password is incorrect" });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
