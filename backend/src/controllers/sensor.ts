import { Request, Response } from "express";
import { Sensor } from "../models/sensor";
import { formatDateByLocation } from "@/utils.ts/date";

// GET: ambil semua data sensor
export const getSensors = async (req: Request, res: Response) => {
  try {
    // Filter only documents that have payload field and use lean() for plain objects
    const sensors = await Sensor.find({ payload: { $exists: true } })
      .sort({ "payload.dateTime": -1 })
      .lean();

    if (!sensors || sensors.length === 0) {
      return res.status(404).json({ message: "No sensor data found" });
    }
    
    // Format dateTime for each sensor based on its location
    const formattedSensors = sensors.map(sensor => ({
      pm25: sensor.payload.pm25,
      co: sensor.payload.co,
      no2: sensor.payload.no2,
      o3: sensor.payload.o3,
      temp: sensor.payload.temp,
      hum: sensor.payload.hum,
      loc: sensor.payload.loc,
      dateTime: formatDateByLocation(
        sensor.payload.dateTime,
        sensor.payload.loc
      )
    }));
    
    res.json(formattedSensors);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sensor data", error: err });
  }
};

// GET: ambil 1 data sensor terbaru
export const getLatestSensor = async (req: Request, res: Response) => {
  try {
    const latestSensor = await Sensor.findOne({ payload: { $exists: true } })
      .sort({ "payload.dateTime": -1 })
      .lean();
      
    if (!latestSensor) {
      return res.status(404).json({ message: "No sensor data found" });
    }
    
    // Return payload with formatted dateTime
    const formattedPayload = {
      pm25: latestSensor.payload.pm25,
      co: latestSensor.payload.co,
      no2: latestSensor.payload.no2,
      o3: latestSensor.payload.o3,
      temp: latestSensor.payload.temp,
      hum: latestSensor.payload.hum,
      loc: latestSensor.payload.loc,
      dateTime: formatDateByLocation(
        latestSensor.payload.dateTime,
        latestSensor.payload.loc
      )
    };
    
    res.json(formattedPayload);
  } catch (err) {
    res.status(500).json({ message: "Error fetching latest sensor data", error: err });
  }
};

// // POST: tambah data sensor baru
// export const createSensor = async (req: Request, res: Response) => {
//   try {
//     const { co, pm25, no2, o3, temp, hum, loc } = req.body;

//     const newSensor = new Sensor({
//       co,
//       pm25,
//       no2,
//       o3,
//       temp,
//       hum,
//       loc,
//     });

//     const savedSensor = await newSensor.save();
//     res.status(201).json(savedSensor);
//   } catch (err) {
//     res.status(500).json({ message: "Error creating sensor data", error: err });
//   }
// };
