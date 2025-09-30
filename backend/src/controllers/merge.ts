import { Request, Response } from "express";
import { Sensor } from "../models/sensor";
import { Ispu } from "../models/ispu";

// GET: ambil detail data sensor berdasarkan parameter type
export const getSensorDetailByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

    // Validasi parameter type
    const validTypes = ["co", "pm25", "no2", "o3", "temp", "hum"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid sensor type. Valid types: co, pm25, no2, o3, temp, hum"
      });
    }

    // Ambil data sensor terbaru
    const latestSensor = await Sensor.findOne().sort({ dateTime: -1 });

    if (!latestSensor) {
      return res.status(404).json({ message: "No sensor data found" });
    }

    // Ambil data ISPU terbaru untuk type tertentu (jika tersedia)
    let ispuData = null;
    const ispuTypes = ["co", "pm25", "no2", "o3"];
    if (ispuTypes.includes(type)) {
      ispuData = await Ispu.findOne({ type }).sort({ dateTime: -1 });
    }

    // Ambil nilai sensor berdasarkan type
    const sensorValue = latestSensor[type as keyof typeof latestSensor];

    // Format response
    const response = {
      name: type.toUpperCase(),
      sensorValue: sensorValue,
      ispuValue: ispuData ? ispuData.amount : null,
      dateTime: latestSensor.dateTime,
      location: latestSensor.loc,
      unit: getUnitByType(type)
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sensor detail", error: err });
  }
};

// GET: ambil detail data sensor lengkap (semua parameter)
export const getSensorDetail = async (req: Request, res: Response) => {
  try {
    // Ambil data sensor terbaru
    const latestSensor = await Sensor.findOne().sort({ dateTime: -1 });

    if (!latestSensor) {
      return res.status(404).json({ message: "No sensor data found" });
    }

    // Ambil data ISPU terbaru untuk setiap type
    const ispuTypes = ["co", "pm25", "no2", "o3"];
    const ispuData = await Promise.all(
      ispuTypes.map(async (type) => {
        const data = await Ispu.findOne({ type }).sort({ dateTime: -1 });
        return data;
      })
    );

    // Filter out null values
    const validIspuData = ispuData.filter(data => data !== null);

    // Format response dengan semua parameter
    const response = {
      dateTime: latestSensor.dateTime,
      location: latestSensor.loc,
      sensors: {
        co: {
          name: "CO",
          value: latestSensor.co,
          unit: getUnitByType("co"),
          ispuValue: validIspuData.find(ispu => ispu?.type === "co")?.amount || null
        },
        pm25: {
          name: "PM2.5",
          value: latestSensor.pm25,
          unit: getUnitByType("pm25"),
          ispuValue: validIspuData.find(ispu => ispu?.type === "pm25")?.amount || null
        },
        no2: {
          name: "NO2",
          value: latestSensor.no2,
          unit: getUnitByType("no2"),
          ispuValue: validIspuData.find(ispu => ispu?.type === "no2")?.amount || null
        },
        o3: {
          name: "O3",
          value: latestSensor.o3,
          unit: getUnitByType("o3"),
          ispuValue: validIspuData.find(ispu => ispu?.type === "o3")?.amount || null
        },
        temp: {
          name: "Temperature",
          value: latestSensor.temp,
          unit: getUnitByType("temp"),
        },
        hum: {
          name: "Humidity",
          value: latestSensor.hum,
          unit: getUnitByType("hum"),
        }
      }
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sensor detail", error: err });
  }
};

// Helper function untuk mendapatkan unit berdasarkan type
const getUnitByType = (type: string): string => {
  const units: Record<string, string> = {
    co: "µg/m³",
    pm25: "µg/m³",
    no2: "µg/m³",
    o3: "µg/m³",
    temp: "°C",
    hum: "%"
  };
  return units[type] || "";
};
