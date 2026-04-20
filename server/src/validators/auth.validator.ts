import { z } from "zod";
import { Role } from "../models/User";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum([Role.STUDENT, Role.FACULTY]).optional(),
  instituteId: z.string().min(1, "Institute ID is required"),
  phone: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  const role = data.role || Role.STUDENT;
  if (role === Role.STUDENT) {
    const studentRegex = /^[a-zA-Z]*\d{2}[a-zA-Z]{2,4}\d[a-zA-Z]\d+@student\.nitw\.ac\.in$/;
    if (!studentRegex.test(data.email)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Student email must be in format like 25csm1r19@student.nitw.ac.in",
        path: ["email"]
      });
    }
  } else if (role === Role.FACULTY) {
    if (!data.email.endsWith("@nitw.ac.in") || data.email.endsWith("@student.nitw.ac.in")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Faculty email must be a valid @nitw.ac.in email",
        path: ["email"]
      });
    }
  }
});

export const adminCreateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").regex(/@nitw\.ac\.in$/, "Must be an institute email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(Role).optional(),
  instituteId: z.string().min(1, "Institute ID is required"),
  phone: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  const role = data.role || Role.STUDENT;
  if (role === Role.STUDENT) {
    const studentRegex = /^[a-zA-Z]*\d{2}[a-zA-Z]{2,4}\d[a-zA-Z]\d+@student\.nitw\.ac\.in$/;
    if (!studentRegex.test(data.email)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Student email must be in format like 25csm1r19@student.nitw.ac.in",
        path: ["email"]
      });
    }
  }
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});