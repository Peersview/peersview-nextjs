import { z } from "zod";

export const jobTypeEnum = z.enum([
  "full-time",
  "part-time",
  "internship",
  "graduate",
  "co-op",
]);
export type JobType = z.infer<typeof jobTypeEnum>;

export const createJobSchema = z.object({
  title: z.string().min(1, "Job title is required").max(120),
  companyId: z.string().min(1, "Company is required"),
  jobFunction: z.string().min(1, "Job description is required"),
  type: jobTypeEnum,
  industry: z.string().min(1, "Industry is required"),
  country: z.string().default("CA"),
  province: z.string().min(1, "Province / State is required"),
  city: z.string().min(1, "City is required"),
  experience: z.string().optional().default(""),
  deadline: z.coerce.date({ message: "Application deadline is required" }),
  sourceLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  price: z.string().min(1, "Salary / pay is required"),
  currency: z.string().default("$"),
  coreSkills: z.string().optional().default(""),
  multipleSkills: z.string().optional().default(""),
  contact: z.string().min(1, "Contact email or phone is required"),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export const jobSearchSchema = z.object({
  q: z.string().optional(),
  type: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  industry: z.string().optional(),
  company: z.string().optional(),
  workAuth: z.string().optional(),
});
export type JobSearchInput = z.infer<typeof jobSearchSchema>;

export interface JobFilters {
  q?: string;
  type?: JobType;
  province?: string;
  city?: string;
  industry?: string;
  company?: string;
  workAuth?: boolean;
}

export const applyJobSchema = z.object({
  jobId: z.string().min(1, "Job is required"),
  resumeUrl: z.string().url("Resume must be a valid URL"),
  coverLetterUrl: z
    .string()
    .url("Cover letter must be a valid URL")
    .optional()
    .or(z.literal("")),
});
export type ApplyJobInput = z.infer<typeof applyJobSchema>;
