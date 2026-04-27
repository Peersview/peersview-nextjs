import { Schema, Types, model, models, type Model } from "mongoose";

export interface SavedJobDocument {
  _id: string;
  userId: Types.ObjectId;
  jobId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const savedJobSchema = new Schema<SavedJobDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
  },
  { timestamps: true, collection: "savedjobs" },
);

savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const SavedJob: Model<SavedJobDocument> =
  (models.SavedJob as Model<SavedJobDocument>) ||
  model<SavedJobDocument>("SavedJob", savedJobSchema);
