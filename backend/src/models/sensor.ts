import { Schema, model, Document } from "mongoose";

export interface ISensor extends Document {
  co: number;
  pm25: number;
  no2: number;
  o3: number;
  temp: number;
  hum: number;
  loc: string;
  dateTime: Date;
}

const SensorSchema = new Schema<ISensor>(
  {
    co: { type: Number, required: true },
    pm25: { type: Number, required: true },
    temp: { type: Number, required: true },
    hum: { type: Number, required: true },
    loc: { type: String, required: true },
    no2: { type: Number, required: true },
    o3: { type: Number, required: true },
    dateTime: { type: Date, default: Date.now }
  },
);

export const Sensor = model<ISensor>("Sensor", SensorSchema);
