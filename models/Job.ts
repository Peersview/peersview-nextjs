import { Schema, Types, model, models, type Model } from "mongoose";

export interface JobDocument {
  _id: string;
  userId: Types.ObjectId;
  companyId: Types.ObjectId;
  title: string;
  jobFunction: string;
  type: "full-time" | "part-time" | "internship" | "graduate" | "co-op";
  industry: string;
  country: string;
  province: string;
  city: string;
  experience?: string;
  deadline: Date;
  sourceLink?: string;
  price: string;
  currency: string;
  coreSkills?: string;
  multipleSkills?: string;
  contact: string;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<JobDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, index: true },
    jobFunction: { type: String, required: true },
    type: {
      type: String,
      enum: ["full-time", "part-time", "internship", "graduate", "co-op"],
      required: true,
    },
    industry: { type: String, required: true },
    country: { type: String, required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
    experience: { type: String },
    deadline: { type: Date, required: true },
    sourceLink: { type: String },
    price: { type: String, required: true },
    currency: { type: String, default: "$" },
    coreSkills: { type: String },
    multipleSkills: { type: String },
    contact: { type: String, required: true },
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Job: Model<JobDocument> =
  (models.Job as Model<JobDocument>) || model<JobDocument>("Job", jobSchema);
