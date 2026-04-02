import User, { Role } from "../models/User";

export const seedAdmin = async (): Promise<void> => {
  const adminExists = await User.findOne({ role: Role.ADMIN });

  if (!adminExists) {
    await User.create({
      name: "System Admin",
      email: "admin@nitw.ac.in",
      password: "admin123",
      role: Role.ADMIN,
      instituteId: "ADMIN001",
    });
    console.log("Default admin created: admin@nitw.ac.in / admin123");
  }
};