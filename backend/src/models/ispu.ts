import { Schema, model, Document } from "mongoose";

export interface IIspu extends Document {
  type: "co" | "pm25" | "o3" | "no2";
  amount: number;
  dateTime: Date;
}

const IspuSchema = new Schema<IIspu>(
  {
    type: { type: String, enum: ["co", "pm25", "o3", "no2"], required: true },
    amount: { type: Number, required: true },
    dateTime: { type: Date, default: Date.now },
  },
);

export const Ispu = model<IIspu>("Ispu", IspuSchema);
