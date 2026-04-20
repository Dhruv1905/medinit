import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export enum Role {
  STUDENT = "student",
  FACULTY = "faculty",
  DOCTOR = "doctor",
  NURSE = "nurse",
  PHARMACIST = "pharmacist",
  ADMIN = "admin",
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  instituteId: string;
  phone?: string;
  bloodGroup?: string;
  allergies?: string[];
  profilePicture?: string;
  isActive: boolean;
  resetOtp?: string;
  resetOtpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^[\w.-]+@(?:student\.)?nitw\.ac\.in$/, "Must be a valid institute email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.STUDENT,
    },
    instituteId: {
      type: String,
      required: [true, "Institute ID is required"],
      unique: true,
    },
    phone: { type: String },
    bloodGroup: { type: String },
    allergies: [{ type: String }],
    profilePicture: { type: String },
    isActive: { type: Boolean, default: true },
    resetOtp: { type: String, select: false },
    resetOtpExpiry: { type: Date, select: false },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);