"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestSensor = exports.getSensors = void 0;
const sensor_1 = require("../models/sensor");
const date_1 = require("../utils/date");
const getSensors = async (req, res) => {
    try {
        const sensors = await sensor_1.Sensor.find({ payload: { $exists: true } })
            .sort({ "payload.dateTime": -1 })
            .lean();
        if (!sensors || sensors.length === 0) {
            return res.status(404).json({ message: "No sensor data found" });
        }
        const formattedSensors = sensors.map(sensor => ({
            pm25: sensor.payload.pm25,
            co: sensor.payload.co,
            no2: sensor.payload.no2,
            o3: sensor.payload.o3,
            temp: sensor.payload.temp,
            hum: sensor.payload.hum,
            loc: sensor.payload.loc,
            dateTime: (0, date_1.formatDateByLocation)(sensor.payload.dateTime, sensor.payload.loc)
        }));
        res.json(formattedSensors);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching sensor data", error: err });
    }
};
exports.getSensors = getSensors;
const getLatestSensor = async (req, res) => {
    try {
        const latestSensor = await sensor_1.Sensor.findOne({ payload: { $exists: true } })
            .sort({ "payload.dateTime": -1 })
            .lean();
        if (!latestSensor) {
            return res.status(404).json({ message: "No sensor data found" });
        }
        const formattedPayload = {
            pm25: latestSensor.payload.pm25,
            co: latestSensor.payload.co,
            no2: latestSensor.payload.no2,
            o3: latestSensor.payload.o3,
            temp: latestSensor.payload.temp,
            hum: latestSensor.payload.hum,
            loc: latestSensor.payload.loc,
            dateTime: (0, date_1.formatDateByLocation)(latestSensor.payload.dateTime, latestSensor.payload.loc)
        };
        res.json(formattedPayload);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching latest sensor data", error: err });
    }
};
exports.getLatestSensor = getLatestSensor;
