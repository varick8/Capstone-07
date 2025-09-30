import { Request, Response } from "express";
import { Sensor } from "../models/sensor";
import { Ispu } from "../models/ispu";

// GET: ambil semua data sensor
export const getSensors = async (req: Request, res: Response) => {
  try {
    const sensors = await Sensor.find().sort({ dateTime: -1 });
    res.json(sensors);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sensor data", error: err });
  }
};

// GET: ambil 1 data sensor terbaru
export const getLatestSensor = async (req: Request, res: Response) => {
  try {
    const latestSensor = await Sensor.findOne().sort({ dateTime: -1 }); // ambil yang terbaru
    if (!latestSensor) {
      return res.status(404).json({ message: "No sensor data found" });
    }
    res.json(latestSensor);
  } catch (err) {
    res.status(500).json({ message: "Error fetching latest sensor data", error: err });
  }
};

// POST: tambah data sensor baru
export const createSensor = async (req: Request, res: Response) => {
  try {
    const { co, pm25, no2, o3, temp, hum, loc } = req.body;

    const newSensor = new Sensor({
      co,
      pm25,
      no2,
      o3,
      temp,
      hum,
      loc,
    });

    const savedSensor = await newSensor.save();
    res.status(201).json(savedSensor);
  } catch (err) {
    res.status(500).json({ message: "Error creating sensor data", error: err });
  }
};
