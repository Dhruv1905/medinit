import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import mongoose from "mongoose";
import { AuthRequest } from "../middlewares/auth.middleware";
import { sendOtpEmail } from "../services/email.service";
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

// Forgot Password — send OTP
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether user exists
      res.json({ message: "If an account exists with this email, an OTP has been sent." });
      return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP before storing
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Store hashed OTP and expiry (10 minutes)
    user.resetOtp = hashedOtp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send OTP via email
    await sendOtpEmail(email, otp);

    res.json({ message: "If an account exists with this email, an OTP has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
};

// Verify OTP (without resetting password yet)
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    const user = await User.findOne({ email }).select("+resetOtp +resetOtpExpiry");
    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    // Check expiry
    if (user.resetOtpExpiry < new Date()) {
      user.resetOtp = undefined;
      user.resetOtpExpiry = undefined;
      await user.save();
      res.status(400).json({ message: "OTP has expired. Please request a new one." });
      return;
    }

    // Compare OTP
    const isValid = await bcrypt.compare(otp, user.resetOtp);
    if (!isValid) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Reset Password (with OTP verification)
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).json({ message: "Email, OTP, and new password are required" });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    const user = await User.findOne({ email }).select("+resetOtp +resetOtpExpiry +password");
    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    // Check expiry
    if (user.resetOtpExpiry < new Date()) {
      user.resetOtp = undefined;
      user.resetOtpExpiry = undefined;
      await user.save();
      res.status(400).json({ message: "OTP has expired. Please request a new one." });
      return;
    }

    // Compare OTP
    const isValid = await bcrypt.compare(otp, user.resetOtp);
    if (!isValid) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    // Reset password & clear OTP
    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successfully. You can now login with your new password." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
