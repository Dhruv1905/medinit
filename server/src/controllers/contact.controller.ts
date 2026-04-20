import { Request, Response } from "express";
import { sendContactEmail } from "../services/email.service";

export const sendContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ message: "Invalid email address" });
      return;
    }

    if (subject.length > 200) {
      res.status(400).json({ message: "Subject is too long" });
      return;
    }

    if (message.length > 2000) {
      res.status(400).json({ message: "Message is too long (max 2000 characters)" });
      return;
    }

    await sendContactEmail(name, email, subject, message);

    res.json({ message: "Your message has been sent successfully. We'll get back to you soon!" });
  } catch (error) {
    console.error("Contact email error:", error);
    res.status(500).json({ message: "Failed to send message. Please try again later." });
  }
};
