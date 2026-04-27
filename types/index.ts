import type { JobType } from "@/schemas/job.schema";

export type UserRole = "user" | "employer";

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  profilePicture?: string;
  emailVerified: boolean;
  createdAt: Date;
}

export interface IUserWithPassword extends IUser {
  password: string;
}

export interface ICompany {
  _id: string;
  userId: string;
  name: string;
  logo?: string;
  bio?: string;
  industry?: string;
  country?: string;
  province?: string;
  city?: string;
  createdAt: Date;
}

export interface IJob {
  _id: string;
  userId: string;
  companyId: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyBio: string;
  jobFunction: string;
  type: JobType;
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
}

export type ApplicationStatus = "pending" | "reviewed" | "rejected";

export interface IJobApplication {
  _id: string;
  jobId: string;
  userId: string;
  resumeUrl: string;
  coverLetterUrl?: string;
  status: ApplicationStatus;
  createdAt: Date;
}

export type IApplication = IJobApplication;

export type ActionResult<T = unknown> =
  | { data: T; error?: never }
  | { data?: never; error: Record<string, string[] | undefined> };
