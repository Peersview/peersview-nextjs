import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { JobApplication } from "@/models/JobApplication";
import type { IJobApplication } from "@/types";
import type { ApplyJobInput } from "@/schemas/job.schema";

function serialize(doc: Record<string, unknown>): IJobApplication {
  return {
    ...(doc as unknown as IJobApplication),
    _id: String(doc._id),
    jobId: String(doc.jobId),
    userId: String(doc.userId),
  };
}

export async function applyToJob(
  userId: string,
  input: ApplyJobInput,
): Promise<IJobApplication> {
  if (!Types.ObjectId.isValid(input.jobId)) {
    throw new Error("Invalid job id");
  }
  await connectDB();

  const existing = await JobApplication.findOne({
    jobId: new Types.ObjectId(input.jobId),
    userId: new Types.ObjectId(userId),
  }).lean();
  if (existing) {
    throw new Error("You have already applied to this job");
  }

  const created = await JobApplication.create({
    jobId: new Types.ObjectId(input.jobId),
    userId: new Types.ObjectId(userId),
    resumeUrl: input.resumeUrl,
    coverLetterUrl: input.coverLetterUrl || undefined,
  });
  return serialize(created.toObject() as unknown as Record<string, unknown>);
}

export async function getJobApplicationsByUser(
  userId: string,
): Promise<IJobApplication[]> {
  await connectDB();
  const docs = await JobApplication.find({
    userId: new Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .lean();
  return docs.map((d) => serialize(d as unknown as Record<string, unknown>));
}
