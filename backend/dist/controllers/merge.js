"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSensorDetail = exports.getSensorDetailByType = void 0;
const sensor_1 = require("../models/sensor");
const ispu_1 = require("../models/ispu");
const date_1 = require("../utils/date");
const getSensorDetailByType = async (req, res) => {
    try {
        const { type } = req.params;
        const validTypes = ["co", "pm25", "no2", "o3", "temp", "hum"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                message: "Invalid sensor type. Valid types: co, pm25, no2, o3, temp, hum",
            });
        }
        const latestSensor = await sensor_1.Sensor.findOne({ "payload.dateTime": { $exists: true } })
            .sort({ "payload.dateTime": -1 })
            .lean();
        if (!latestSensor) {
            return res.status(404).json({ message: "No sensor data found" });
        }
        const location = latestSensor.payload.loc;
        const ispuTypes = ["co", "pm25", "no2", "o3"];
        let ispuValue = null;
        if (ispuTypes.includes(type)) {
            const ispuData = await ispu_1.Ispu.findOne({ "payload.dateTime": { $exists: true } })
                .sort({ "payload.dateTime": -1 })
                .lean();
            if (ispuData) {
                const rawValue = ispuData.payload[type];
                ispuValue = typeof rawValue === "number" ? rawValue : parseFloat(String(rawValue));
            }
        }
        const sensorValue = latestSensor.payload[type];
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const formatDate = (d) => d.toISOString().split("T")[0];
        const startDate = formatDate(thirtyDaysAgo);
        const endDate = formatDate(today);
        let historicalArray = [];
        if (ispuTypes.includes(type)) {
            const historicalIspuData = await ispu_1.Ispu.find({
                "payload.dateTime": { $exists: true },
            })
                .sort({ "payload.dateTime": 1 })
                .lean();
            const dailyAverages = historicalIspuData.reduce((acc, ispu) => {
                const dateOnly = formatDate(new Date(ispu.payload.dateTime));
                if (dateOnly < startDate || dateOnly > endDate)
                    return acc;
                if (!acc[dateOnly])
                    acc[dateOnly] = { sum: 0, count: 0, date: dateOnly };
                const value = Number(ispu.payload[type]);
                if (!isNaN(value)) {
                    acc[dateOnly].sum += value;
                    acc[dateOnly].count += 1;
                }
                return acc;
            }, {});
            historicalArray = Object.values(dailyAverages).map((d) => ({
                date: d.date,
                value: parseFloat((d.sum / d.count).toFixed(2)),
            }));
        }
        else {
            const historicalSensorData = await sensor_1.Sensor.find({
                "payload.dateTime": { $exists: true },
            })
                .sort({ "payload.dateTime": 1 })
                .lean();
            const dailyAverages = historicalSensorData.reduce((acc, sensor) => {
                const dateOnly = formatDate(new Date(sensor.payload.dateTime));
                if (dateOnly < startDate || dateOnly > endDate)
                    return acc;
                if (!acc[dateOnly])
                    acc[dateOnly] = { sum: 0, count: 0, date: dateOnly };
                const value = Number(sensor.payload[type]);
                if (!isNaN(value)) {
                    acc[dateOnly].sum += value;
                    acc[dateOnly].count += 1;
                }
                return acc;
            }, {});
            historicalArray = Object.values(dailyAverages).map((d) => ({
                date: d.date,
                value: parseFloat((d.sum / d.count).toFixed(2)),
            }));
        }
        historicalArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const response = {
            name: type.toUpperCase(),
            sensorValue,
            ispuValue,
            dateTime: (0, date_1.formatDateByLocation)(latestSensor.payload.dateTime, location),
            location,
            unit: getUnitByType(type),
            historical: historicalArray,
        };
        res.json(response);
    }
    catch (err) {
        console.error("❌ Error fetching sensor detail:", err);
        res.status(500).json({ message: "Error fetching sensor detail", error: err });
    }
};
exports.getSensorDetailByType = getSensorDetailByType;
const getSensorDetail = async (req, res) => {
    try {
        const latestSensor = await sensor_1.Sensor.findOne({ payload: { $exists: true } })
            .sort({ "payload.dateTime": -1 })
            .lean();
        if (!latestSensor) {
            return res.status(404).json({ message: "No sensor data found" });
        }
        const latestIspu = await ispu_1.Ispu.findOne({ payload: { $exists: true } })
            .sort({ "payload.dateTime": -1 })
            .lean();
        const response = {
            dateTime: (0, date_1.formatDateByLocation)(latestSensor.payload.dateTime, latestSensor.payload.loc),
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
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching sensor detail", error: err });
    }
};
exports.getSensorDetail = getSensorDetail;
const getUnitByType = (type) => {
    const units = {
        co: "µg/m³",
        pm25: "µg/m³",
        no2: "µg/m³",
        o3: "µg/m³",
        temp: "°C",
        hum: "%"
    };
    return units[type] || "";
};
