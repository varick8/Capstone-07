import { Request, Response } from "express";
import { Ispu, IIspu } from "@/models/ispu";

// GET: ambil semua data ispu
export const getIspu = async (req: Request, res: Response) => {
  try {
    const ispu = await Ispu.find().sort({ createdAt: -1 });
    res.json(ispu);
  } catch (err) {
    res.status(500).json({ message: "Error fetching ispu data", error: err });
  }
};

export const getLatestIspuPerType = async (_req: Request, res: Response) => {
  try {
    const types: IIspu["type"][] = ["co", "pm25", "o3", "no2"];

    const results = await Promise.all(
      types.map((t) => Ispu.findOne({ type: t }).sort({ dateTime: -1 }).lean())
    );

    const payload = Object.fromEntries(types.map((t, i) => [t, results[i]])) as
      Record<IIspu["type"], typeof results[number] | null>;

    res.json(payload);
  } catch (err: any) {
    res.status(500).json({ message: "Error fetching latest ISPU per type", error: err.message });
  }
};

// POST: tambah data ispu baru
export const createIspu = async (req: Request, res: Response) => {
  try {
    const { type, amount } = req.body;

    const newIspu = new Ispu({
     type,
     amount,
    });

    const savedIspu = await newIspu.save();
    res.status(201).json(savedIspu);
  } catch (err) {
    res.status(500).json({ message: "Error creating ispu data", error: err });
  }
};
