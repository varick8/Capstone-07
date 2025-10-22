import { Request, Response } from "express";
import { Ispu } from "../models/ispu";
import { formatDateByLocation } from "@/utils.ts/date";

// GET: ambil semua data ispu
export const getIspu = async (req: Request, res: Response) => {
  try {
    // Filter only documents that have payload field and use lean() for plain objects
    const ispuData = await Ispu.find({ payload: { $exists: true } })
      .sort({ "payload.dateTime": -1 })
      .lean();

    if (!ispuData || ispuData.length === 0) {
      return res.status(404).json({ message: "No sensor data found" });
    }
    
    // Format dateTime for each ispu data based on location (if applicable)
    const formattedIspu = ispuData.map(ispu => ({
      pm25: ispu.payload.pm25,
      co: ispu.payload.co,
      no2: ispu.payload.no2,
      o3: ispu.payload.o3,
      dateTime: formatDateByLocation(
        ispu.payload.dateTime,
        ispu.payload.loc
      )
    }));
    
    res.json(formattedIspu);
  } catch (err) {
    res.status(500).json({ message: "Error fetching ispu data", error: err });
  }
};

// GET: ambil 1 data ispu terbaru
export const getLatestIspu = async (req: Request, res: Response) => {
  try {
    const latestIspu = await Ispu.findOne({ payload: { $exists: true } })
      .sort({ "payload.dateTime": -1 })
      .lean();
      
    if (!latestIspu) {
      return res.status(404).json({ message: "No ISPU data found" });
    }
    
    // Return payload with formatted dateTime
    const formattedPayload = {
      pm25: latestIspu.payload.pm25,
      co: latestIspu.payload.co,
      no2: latestIspu.payload.no2,
      o3: latestIspu.payload.o3,
      dateTime: formatDateByLocation(
        latestIspu.payload.dateTime,
        latestIspu.payload.loc
      )
    };
    
    res.json(formattedPayload);
  } catch (err) {
    res.status(500).json({ message: "Error fetching latest ISPU data", error: err });
  }
};


// // POST: tambah data ispu baru
// export const createIspu = async (req: Request, res: Response) => {
//   try {
//     const { type, amount } = req.body;

//     const newIspu = new Ispu({
//      type,
//      amount,
//     });

//     const savedIspu = await newIspu.save();
//     res.status(201).json(savedIspu);
//   } catch (err) {
//     res.status(500).json({ message: "Error creating ispu data", error: err });
//   }
// };
