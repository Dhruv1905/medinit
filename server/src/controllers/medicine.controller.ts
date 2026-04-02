import { Request, Response } from "express";
import Medicine from "../models/Medicine";
import {
  createMedicineSchema,
  updateMedicineSchema,
  updateStockSchema,
} from "../validators/medicine.validator";

// Get all medicines
export const getAllMedicines = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, lowStock, expired } = req.query;
    const filter: any = { isActive: true };

    if (search) {
      filter.$text = { $search: search as string };
    }

    if (category) {
      filter.category = category;
    }

    if (lowStock === "true") {
      filter.$expr = { $lte: ["$quantity", "$reorderLevel"] };
    }

    if (expired === "true") {
      filter.expiryDate = { $lt: new Date() };
    }

    const medicines = await Medicine.find(filter).sort({ name: 1 });
    res.json({ medicines });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get medicine by ID
export const getMedicineById = async (req: Request, res: Response): Promise<void> => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      res.status(404).json({ message: "Medicine not found" });
      return;
    }
    res.json({ medicine });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Create medicine
export const createMedicine = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createMedicineSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error?.format() });
      return;
    }

    const existing = await Medicine.findOne({ batchNumber: parsed.data.batchNumber });
    if (existing) {
      res.status(409).json({ message: "Medicine with this batch number already exists" });
      return;
    }

    const medicine = await Medicine.create({
      ...parsed.data,
      expiryDate: new Date(parsed.data.expiryDate),
    });

    res.status(201).json({ message: "Medicine added successfully", medicine });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update medicine
export const updateMedicine = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = updateMedicineSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error?.format() });
      return;
    }

    const updateData: any = { ...parsed.data };
    if (parsed.data.expiryDate) {
      updateData.expiryDate = new Date(parsed.data.expiryDate);
    }

    const medicine = await Medicine.findByIdAndUpdate(req.params.id, updateData, { returnDocument: "after" });
    if (!medicine) {
      res.status(404).json({ message: "Medicine not found" });
      return;
    }

    res.json({ message: "Medicine updated", medicine });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update stock only
export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = updateStockSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error?.format() });
      return;
    }

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { quantity: parsed.data.quantity },
      { returnDocument: "after" }
    );

    if (!medicine) {
      res.status(404).json({ message: "Medicine not found" });
      return;
    }

    res.json({ message: "Stock updated", medicine });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete (soft delete)
export const deleteMedicine = async (req: Request, res: Response): Promise<void> => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { returnDocument: "after" }
    );

    if (!medicine) {
      res.status(404).json({ message: "Medicine not found" });
      return;
    }

    res.json({ message: "Medicine removed", medicine });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get inventory stats
export const getInventoryStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const totalMedicines = await Medicine.countDocuments({ isActive: true });

    const lowStockCount = await Medicine.countDocuments({
      isActive: true,
      $expr: { $lte: ["$quantity", "$reorderLevel"] },
    });

    const expiredCount = await Medicine.countDocuments({
      isActive: true,
      expiryDate: { $lt: new Date() },
    });

    const totalValue = await Medicine.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: { $multiply: ["$quantity", "$unitPrice"] } } } },
    ]);

    res.json({
      stats: {
        totalMedicines,
        lowStockCount,
        expiredCount,
        totalValue: totalValue[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};