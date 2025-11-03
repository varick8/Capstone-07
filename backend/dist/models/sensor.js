"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sensor = void 0;
const mongoose_1 = require("mongoose");
const PayloadSchema = new mongoose_1.Schema({
    co: { type: String, required: true },
    pm25: { type: String, required: true },
    no2: { type: String, required: true },
    o3: { type: String, required: true },
    temp: { type: String, required: true },
    hum: { type: String, required: true },
    loc: { type: String, required: true },
    dateTime: { type: Date, required: true }
}, { _id: false });
const SensorSchema = new mongoose_1.Schema({
    topic: { type: String, required: true },
    payload: { type: PayloadSchema, required: true },
    qos: { type: Number, required: true, default: 0 },
    retain: { type: Boolean, required: true, default: false },
    _msgid: { type: String, required: true }
});
exports.Sensor = (0, mongoose_1.model)("Sensor", SensorSchema);
