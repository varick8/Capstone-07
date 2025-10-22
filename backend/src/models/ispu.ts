import { Schema, model, Document } from "mongoose";

export interface IIspuPayload {
  pm25: number;
  co: number;
  no2: number;
  o3: number;
  loc: string;
  dateTime: Date;
}

export interface IIspu extends Document {
  topic: string;
  payload: IIspuPayload;
  qos: number;
  retain: boolean;
  _msgid: string;
}

const IspuPayloadSchema = new Schema<IIspuPayload>(
  {
    pm25: { type: Number, required: true },
    co: { type: Number, required: true },
    no2: { type: Number, required: true },
    o3: { type: Number, required: true },
    loc: { type: String, required: true },
    dateTime: { type: Date, required: true }
  },
  { _id: false }
);

const IspuSchema = new Schema<IIspu>(
  {
    topic: { type: String, required: true },
    payload: { type: IspuPayloadSchema, required: true },
    qos: { type: Number, required: true, default: 0 },
    retain: { type: Boolean, required: true, default: false },
    _msgid: { type: String, required: true }
  }
);

export const Ispu = model<IIspu>("Ispu", IspuSchema);