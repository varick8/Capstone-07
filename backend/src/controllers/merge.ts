import { Request, Response } from "express";
import { Sensor } from "../models/sensor";
import { Ispu } from "../models/ispu";
import { formatDateByLocation } from "@/utils/date";

// GET: ambil detail data sensor berdasarkan parameter type
export const getSensorDetailByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

    // Valid sensor types
    const validTypes = ["co", "pm25", "no2", "o3", "temp", "hum"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid sensor type. Valid types: co, pm25, no2, o3, temp, hum",
      });
    }

    // Get the latest sensor
    const latestSensor = await Sensor.findOne({ "payload.dateTime": { $exists: true } })
      .sort({ "payload.dateTime": -1 })
      .lean();

    if (!latestSensor) {
      return res.status(404).json({ message: "No sensor data found" });
    }

    const location = latestSensor.payload.loc;

    // ISPU types
    const ispuTypes = ["co", "pm25", "no2", "o3"];
    let ispuValue: number | null = null;

    if (ispuTypes.includes(type)) {
      const ispuData = await Ispu.findOne({ "payload.dateTime": { $exists: true } })
        .sort({ "payload.dateTime": -1 })
        .lean();

      if (ispuData) {
        const rawValue = ispuData.payload[type as keyof typeof ispuData.payload];
        ispuValue = typeof rawValue === "number" ? rawValue : parseFloat(String(rawValue));
      }
    }

    const sensorValue = latestSensor.payload[type as keyof typeof latestSensor.payload];

    // === Strict date-based calculation (no time used) ===
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Convert both to YYYY-MM-DD
    const formatDate = (d: Date) => d.toISOString().split("T")[0];
    const startDate = formatDate(thirtyDaysAgo);
    const endDate = formatDate(today);

    // console.log("📅 Date range (date only):", startDate, "→", endDate);

    let historicalArray: any[] = [];

    // === For ISPU types ===
    if (ispuTypes.includes(type)) {
      const historicalIspuData = await Ispu.find({
        "payload.dateTime": { $exists: true },
      })
        .sort({ "payload.dateTime": 1 })
        .lean();

      const dailyAverages = historicalIspuData.reduce((acc: any, ispu) => {
        const dateOnly = formatDate(new Date(ispu.payload.dateTime));
        if (dateOnly < startDate || dateOnly > endDate) return acc; // skip out of range

        if (!acc[dateOnly]) acc[dateOnly] = { sum: 0, count: 0, date: dateOnly };

        const value = Number(ispu.payload[type as keyof typeof ispu.payload]);
        if (!isNaN(value)) {
          acc[dateOnly].sum += value;
          acc[dateOnly].count += 1;
        }

        return acc;
      }, {});

      historicalArray = Object.values(dailyAverages).map((d: any) => ({
        date: d.date,
        value: parseFloat((d.sum / d.count).toFixed(2)),
      }));
    }

    // === For temp or hum ===
    else {
      const historicalSensorData = await Sensor.find({
        "payload.dateTime": { $exists: true },
      })
        .sort({ "payload.dateTime": 1 })
        .lean();

      const dailyAverages = historicalSensorData.reduce((acc: any, sensor) => {
        const dateOnly = formatDate(new Date(sensor.payload.dateTime));
        if (dateOnly < startDate || dateOnly > endDate) return acc; // skip out of range

        if (!acc[dateOnly]) acc[dateOnly] = { sum: 0, count: 0, date: dateOnly };

        const value = Number(sensor.payload[type as keyof typeof sensor.payload]);
        if (!isNaN(value)) {
          acc[dateOnly].sum += value;
          acc[dateOnly].count += 1;
        }

        return acc;
      }, {});

      historicalArray = Object.values(dailyAverages).map((d: any) => ({
        date: d.date,
        value: parseFloat((d.sum / d.count).toFixed(2)),
      }));
    }

    // Sort by date
    historicalArray.sort(
      (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const response = {
      name: type.toUpperCase(),
      sensorValue,
      ispuValue,
      dateTime: formatDateByLocation(latestSensor.payload.dateTime, location),
      location,
      unit: getUnitByType(type),
      historical: historicalArray,
    };

    res.json(response);
  } catch (err) {
    console.error("❌ Error fetching sensor detail:", err);
    res.status(500).json({ message: "Error fetching sensor detail", error: err });
  }
};


// GET: ambil detail data sensor lengkap (semua parameter)
export const getSensorDetail = async (req: Request, res: Response) => {
  try {
    // Ambil data sensor terbaru
    const latestSensor = await Sensor.findOne({ payload: { $exists: true } })
      .sort({ "payload.dateTime": -1 })
      .lean();

    if (!latestSensor) {
      return res.status(404).json({ message: "No sensor data found" });
    }

    // Ambil data ISPU terbaru
    const latestIspu = await Ispu.findOne({ payload: { $exists: true } })
      .sort({ "payload.dateTime": -1 })
      .lean();

    // Format response dengan semua parameter
    const response = {
      dateTime: formatDateByLocation(
        latestSensor.payload.dateTime,
        latestSensor.payload.loc
      ),
      location: latestSensor.payload.loc,
      sensors: {
        co: {
          name: "CO",
          value: latestSensor.payload.co,
          unit: getUnitByType("co"),
          ispuValue: latestIspu?.payload.co || null
        },
        pm25: {
          name: "PM2.5",
          value: latestSensor.payload.pm25,
          unit: getUnitByType("pm25"),
          ispuValue: latestIspu?.payload.pm25 || null
        },
        no2: {
          name: "NO2",
          value: latestSensor.payload.no2,
          unit: getUnitByType("no2"),
          ispuValue: latestIspu?.payload.no2 || null
        },
        o3: {
          name: "O3",
          value: latestSensor.payload.o3,
          unit: getUnitByType("o3"),
          ispuValue: latestIspu?.payload.o3 || null
        },
        temp: {
          name: "Temperature",
          value: latestSensor.payload.temp,
          unit: getUnitByType("temp"),
        },
        hum: {
          name: "Humidity",
          value: latestSensor.payload.hum,
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