"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestIspu = exports.getIspu = void 0;
const ispu_1 = require("../models/ispu");
const date_1 = require("../utils/date");
const getIspu = async (req, res) => {
    try {
        const ispuData = await ispu_1.Ispu.find({ payload: { $exists: true } })
            .sort({ "payload.dateTime": -1 })
            .lean();
        if (!ispuData || ispuData.length === 0) {
            return res.status(404).json({ message: "No sensor data found" });
        }
        const formattedIspu = ispuData.map(ispu => ({
            pm25: ispu.payload.pm25,
            co: ispu.payload.co,
            no2: ispu.payload.no2,
            o3: ispu.payload.o3,
            dateTime: (0, date_1.formatDateByLocation)(ispu.payload.dateTime, ispu.payload.loc)
        }));
        res.json(formattedIspu);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching ispu data", error: err });
    }
};
exports.getIspu = getIspu;
const getLatestIspu = async (req, res) => {
    try {
        const latestIspu = await ispu_1.Ispu.findOne({ payload: { $exists: true } })
            .sort({ "payload.dateTime": -1 })
            .lean();
        if (!latestIspu) {
            return res.status(404).json({ message: "No ISPU data found" });
        }
        const formattedPayload = {
            pm25: latestIspu.payload.pm25,
            co: latestIspu.payload.co,
            no2: latestIspu.payload.no2,
            o3: latestIspu.payload.o3,
            dateTime: (0, date_1.formatDateByLocation)(latestIspu.payload.dateTime, latestIspu.payload.loc)
        };
        res.json(formattedPayload);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching latest ISPU data", error: err });
    }
};
exports.getLatestIspu = getLatestIspu;
