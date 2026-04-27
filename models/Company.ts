import { Schema, Types, model, models, type Model } from "mongoose";

export interface CompanyDocument {
  _id: string;
  userId: Types.ObjectId;
  name: string;
  logo?: string;
  bio?: string;
  industry?: string;
  country?: string;
  province?: string;
  city?: string;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<CompanyDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    logo: { type: String },
    bio: { type: String, maxlength: 1024 },
    industry: { type: String },
    country: { type: String },
    province: { type: String },
    city: { type: String },
  },
  { timestamps: true },
);

export const Company: Model<CompanyDocument> =
  (models.Company as Model<CompanyDocument>) ||
  model<CompanyDocument>("Company", companySchema);
