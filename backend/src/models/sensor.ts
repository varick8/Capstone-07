import { Schema, model, Document } from "mongoose";

export interface IPayload {
  co: string;
  pm25: string;
  no2: string;
  o3: string;
  temp: string;
  hum: string;
  loc: string;
  dateTime: Date;
}

export interface ISensor extends Document {
  topic: string;
  payload: IPayload;
  qos: number;
  retain: boolean;
  _msgid: string;
}

const PayloadSchema = new Schema<IPayload>(
  {
    co: { type: String, required: true },
    pm25: { type: String, required: true },
    no2: { type: String, required: true },
    o3: { type: String, required: true },
    temp: { type: String, required: true },
    hum: { type: String, required: true },
    loc: { type: String, required: true },
    dateTime: { type: Date, required: true }
  },
  { _id: false }
);

const SensorSchema = new Schema<ISensor>(
  {
    topic: { type: String, required: true },
    payload: { type: PayloadSchema, required: true },
    qos: { type: Number, required: true, default: 0 },
    retain: { type: Boolean, required: true, default: false },
    _msgid: { type: String, required: true }
  }
);

export const Sensor = model<ISensor>("Sensor", SensorSchema);