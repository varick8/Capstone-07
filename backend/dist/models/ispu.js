"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ispu = void 0;
const mongoose_1 = require("mongoose");
const IspuPayloadSchema = new mongoose_1.Schema({
    pm25: { type: Number, required: true },
    co: { type: Number, required: true },
    no2: { type: Number, required: true },
    o3: { type: Number, required: true },
    loc: { type: String, required: true },
    dateTime: { type: Date, required: true }
}, { _id: false });
const IspuSchema = new mongoose_1.Schema({
    topic: { type: String, required: true },
    payload: { type: IspuPayloadSchema, required: true },
    qos: { type: Number, required: true, default: 0 },
    retain: { type: Boolean, required: true, default: false },
    _msgid: { type: String, required: true }
});
exports.Ispu = (0, mongoose_1.model)("Ispu", IspuSchema);
