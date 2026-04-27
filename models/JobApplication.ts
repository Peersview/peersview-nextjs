import { Schema, Types, model, models, type Model } from "mongoose";

export interface JobApplicationDocument {
  _id: string;
  jobId: Types.ObjectId;
  userId: Types.ObjectId;
  resumeUrl: string;
  coverLetterUrl?: string;
  status: "pending" | "reviewed" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const jobApplicationSchema = new Schema<JobApplicationDocument>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    resumeUrl: { type: String, required: true },
    coverLetterUrl: { type: String },
    status: {
      type: String,
      enum: ["pending", "reviewed", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true, collection: "jobapplications" },
);

jobApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

export const JobApplication: Model<JobApplicationDocument> =
  (models.JobApplication as Model<JobApplicationDocument>) ||
  model<JobApplicationDocument>("JobApplication", jobApplicationSchema);
