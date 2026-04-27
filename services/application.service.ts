import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { JobApplication } from "@/models/JobApplication";
import { User } from "@/models/User";
import type { IJobApplication } from "@/types";

export interface ApplicationWithDetails extends IJobApplication {
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
}

interface AppLeanDoc {
  _id: unknown;
  jobId: Types.ObjectId;
  userId: Types.ObjectId;
  resumeUrl: string;
  coverLetterUrl?: string;
  status: IJobApplication["status"];
  createdAt: Date;
}

/**
 * Returns all applications for jobs posted by the given employer userId,
 * with applicant name/email and job title joined in.
 */
export async function getApplicationsForEmployer(
  employerUserId: string,
): Promise<ApplicationWithDetails[]> {
  await connectDB();

  // Find all job IDs posted by this employer.
  const employerJobs = (await Job.find({
    userId: new Types.ObjectId(employerUserId),
  })
    .select({ _id: 1, title: 1 })
    .lean()) as unknown as { _id: Types.ObjectId; title: string }[];

  if (employerJobs.length === 0) return [];

  const jobIds = employerJobs.map((j) => j._id);
  const jobTitleMap = new Map(
    employerJobs.map((j) => [String(j._id), j.title]),
  );

  // Fetch all applications for these jobs.
  const apps = (await JobApplication.find({
    jobId: { $in: jobIds },
  } as Record<string, unknown>)
    .sort({ createdAt: -1 })
    .lean()) as unknown as AppLeanDoc[];

  if (apps.length === 0) return [];

  // Bulk-fetch applicant user details.
  const userIds = Array.from(new Set(apps.map((a) => String(a.userId))));
  const users = (await User.find({
    _id: { $in: userIds.map((id) => new Types.ObjectId(id)) },
  } as Record<string, unknown>)
    .select({ _id: 1, firstName: 1, lastName: 1, email: 1 })
    .lean()) as unknown as {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
  }[];

  const userMap = new Map(
    users.map((u) => [
      String(u._id),
      { name: `${u.firstName} ${u.lastName}`.trim(), email: u.email },
    ]),
  );

  return apps.map((app) => {
    const user = userMap.get(String(app.userId));
    return {
      _id: String(app._id),
      jobId: String(app.jobId),
      userId: String(app.userId),
      resumeUrl: app.resumeUrl,
      coverLetterUrl: app.coverLetterUrl,
      status: app.status,
      createdAt: app.createdAt,
      jobTitle: jobTitleMap.get(String(app.jobId)) ?? "Unknown Job",
      applicantName: user?.name ?? "Unknown",
      applicantEmail: user?.email ?? "—",
    };
  });
}
