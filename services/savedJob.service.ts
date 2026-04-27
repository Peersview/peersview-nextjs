import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { SavedJob } from "@/models/SavedJob";
import { getJobById, getJobsByIds } from "@/services/job.service";
import type { IJob } from "@/types";

export async function saveJob(userId: string, jobId: string): Promise<void> {
  if (!Types.ObjectId.isValid(jobId)) {
    throw new Error("Invalid job id");
  }
  await connectDB();

  const job = await getJobById(jobId);
  if (!job) throw new Error("Job not found");

  await SavedJob.updateOne(
    {
      userId: new Types.ObjectId(userId),
      jobId: new Types.ObjectId(jobId),
    },
    { $setOnInsert: { createdAt: new Date() } },
    { upsert: true },
  );
}

export async function unsaveJob(
  userId: string,
  jobId: string,
): Promise<void> {
  if (!Types.ObjectId.isValid(jobId)) {
    throw new Error("Invalid job id");
  }
  await connectDB();
  await SavedJob.deleteOne({
    userId: new Types.ObjectId(userId),
    jobId: new Types.ObjectId(jobId),
  });
}

export async function getSavedJobIds(userId: string): Promise<Set<string>> {
  await connectDB();
  const docs = (await SavedJob.find({
    userId: new Types.ObjectId(userId),
  })
    .select({ jobId: 1 })
    .lean()) as unknown as { jobId: Types.ObjectId }[];
  return new Set(docs.map((d) => String(d.jobId)));
}

export async function getSavedJobs(userId: string): Promise<IJob[]> {
  await connectDB();
  const docs = (await SavedJob.find({
    userId: new Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .lean()) as unknown as { jobId: Types.ObjectId }[];
  if (docs.length === 0) return [];
  const ids = docs.map((d) => String(d.jobId));
  const jobs = await getJobsByIds(ids);
  // Preserve saved-order
  const order = new Map(ids.map((id, i) => [id, i]));
  return jobs.sort(
    (a, b) => (order.get(a._id) ?? 0) - (order.get(b._id) ?? 0),
  );
}
