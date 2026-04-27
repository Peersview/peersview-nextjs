import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { Company, type CompanyDocument } from "@/models/Company";
import type { IJob } from "@/types";
import type { CreateJobInput, JobFilters } from "@/schemas/job.schema";

interface JobLeanDoc {
  _id: unknown;
  userId: unknown;
  companyId: unknown;
  title: string;
  jobFunction: string;
  type: IJob["type"];
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

function serialize(doc: JobLeanDoc, company: CompanyDocument | null): IJob {
  return {
    _id: String(doc._id),
    userId: String(doc.userId),
    companyId: String(doc.companyId),
    title: doc.title,
    company: company?.name ?? "",
    companyLogo: company?.logo,
    companyBio: company?.bio ?? "",
    jobFunction: doc.jobFunction,
    type: doc.type,
    industry: doc.industry,
    country: doc.country,
    province: doc.province,
    city: doc.city,
    experience: doc.experience,
    deadline: doc.deadline,
    sourceLink: doc.sourceLink,
    price: doc.price,
    currency: doc.currency,
    coreSkills: doc.coreSkills,
    multipleSkills: doc.multipleSkills,
    contact: doc.contact,
    isPremium: doc.isPremium,
    createdAt: doc.createdAt,
  };
}

async function loadCompaniesForJobs(
  jobs: JobLeanDoc[],
): Promise<Map<string, CompanyDocument>> {
  const ids = Array.from(new Set(jobs.map((j) => String(j.companyId))));
  if (ids.length === 0) return new Map();
  const objectIds = ids.map((id) => new Types.ObjectId(id));
  const companies = (await Company.find({ _id: { $in: objectIds } } as Record<string, unknown>)
    .lean()) as unknown as CompanyDocument[];
  return new Map(companies.map((c) => [String(c._id), c]));
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedJobs {
  jobs: IJob[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

async function buildJobFilter(f: JobFilters): Promise<Record<string, unknown>> {
  const and: Record<string, unknown>[] = [];

  if (f.q) {
    const companies = (await Company.find({
      name: { $regex: escapeRegex(f.q), $options: "i" },
    })
      .select({ _id: 1 })
      .lean()) as unknown as { _id: Types.ObjectId }[];
    const companyIdsForQuery = companies.map((c) => c._id);

    and.push({
      $or: [
        { title: { $regex: escapeRegex(f.q), $options: "i" } },
        { city: { $regex: escapeRegex(f.q), $options: "i" } },
        { industry: { $regex: escapeRegex(f.q), $options: "i" } },
        ...(companyIdsForQuery.length > 0
          ? [{ companyId: { $in: companyIdsForQuery } }]
          : []),
      ],
    });
  }

  if (f.type) and.push({ type: f.type });
  // Case-insensitive exact match: legacy data has values like "Ontario", "ontario", "ONTARIO".
  if (f.province) {
    and.push({
      province: { $regex: `^${escapeRegex(f.province)}$`, $options: "i" },
    });
  }
  // Cities are messy ("BARRIE", "Toronto", "Ajax, Ontario", ...) — substring + case-insensitive.
  if (f.city) {
    and.push({ city: { $regex: escapeRegex(f.city), $options: "i" } });
  }
  if (f.industry) {
    and.push({
      industry: { $regex: escapeRegex(f.industry), $options: "i" },
    });
  }

  if (f.company) {
    const matches = (await Company.find({
      name: { $regex: escapeRegex(f.company), $options: "i" },
    })
      .select({ _id: 1 })
      .lean()) as unknown as { _id: Types.ObjectId }[];
    if (matches.length === 0) {
      // Force no-match by using an impossible filter.
      return { _id: { $exists: false } };
    }
    and.push({ companyId: { $in: matches.map((c) => c._id) } });
  }

  return and.length > 0 ? { $and: and } : {};
}

export async function getJobs(
  filters: JobFilters | string = {},
): Promise<IJob[]> {
  await connectDB();

  const f: JobFilters =
    typeof filters === "string" ? { q: filters } : filters ?? {};

  const filter = await buildJobFilter(f);

  const docs = (await Job.find(filter)
    .sort({ createdAt: -1 })
    .lean()) as unknown as JobLeanDoc[];
  const companyMap = await loadCompaniesForJobs(docs);
  return docs.map((d) => serialize(d, companyMap.get(String(d.companyId)) ?? null));
}

export async function getJobsPaginated(
  filters: JobFilters = {},
  { page = 1, limit = 12 }: PaginationOptions = {},
): Promise<PaginatedJobs> {
  await connectDB();

  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(50, Math.max(1, Math.floor(limit)));
  const skip = (safePage - 1) * safeLimit;

  const filter = await buildJobFilter(filters);

  const [docs, total] = await Promise.all([
    Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean() as unknown as Promise<JobLeanDoc[]>,
    Job.countDocuments(filter),
  ]);

  const companyMap = await loadCompaniesForJobs(docs);
  const jobs = docs.map((d) =>
    serialize(d, companyMap.get(String(d.companyId)) ?? null),
  );

  return {
    jobs,
    total,
    page: safePage,
    limit: safeLimit,
    hasMore: skip + jobs.length < total,
  };
}

export async function getJobById(id: string): Promise<IJob | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDB();
  const doc = (await Job.findById(id).lean()) as unknown as JobLeanDoc | null;
  if (!doc) return null;
  const company = (await Company.findById(doc.companyId).lean()) as unknown as
    | CompanyDocument
    | null;
  return serialize(doc, company);
}

export async function getJobsByIds(ids: string[]): Promise<IJob[]> {
  await connectDB();
  const valid = ids.filter((id) => Types.ObjectId.isValid(id));
  if (valid.length === 0) return [];
  const objectIds = valid.map((id) => new Types.ObjectId(id));
  const docs = (await Job.find({
    _id: { $in: objectIds },
  } as Record<string, unknown>).lean()) as unknown as JobLeanDoc[];
  const companyMap = await loadCompaniesForJobs(docs);
  return docs.map((d) =>
    serialize(d, companyMap.get(String(d.companyId)) ?? null),
  );
}

export async function createJob(
  userId: string,
  input: CreateJobInput,
): Promise<IJob> {
  await connectDB();

  if (!Types.ObjectId.isValid(input.companyId)) {
    throw new Error("Invalid company");
  }
  const company = (await Company.findById(input.companyId).lean()) as unknown as
    | CompanyDocument
    | null;
  if (!company) {
    throw new Error("Company not found");
  }

  const created = await Job.create({
    userId: new Types.ObjectId(userId),
    companyId: new Types.ObjectId(input.companyId),
    title: input.title,
    jobFunction: input.jobFunction,
    type: input.type,
    industry: input.industry,
    country: input.country,
    province: input.province,
    city: input.city,
    experience: input.experience,
    deadline: input.deadline,
    sourceLink: input.sourceLink,
    price: input.price,
    currency: input.currency,
    coreSkills: input.coreSkills,
    multipleSkills: input.multipleSkills,
    contact: input.contact,
  });
  return serialize(created.toObject() as unknown as JobLeanDoc, company);
}

/**
 * Returns the unique province codes used by existing jobs, useful for filter options.
 */
export async function getDistinctProvinces(): Promise<string[]> {
  await connectDB();
  const provinces = (await Job.distinct("province")) as string[];
  return provinces.filter(Boolean).sort();
}

/**
 * Returns the unique industries used by existing jobs.
 */
export async function getDistinctIndustries(): Promise<string[]> {
  await connectDB();
  const industries = (await Job.distinct("industry")) as string[];
  return industries.filter(Boolean).sort();
}

/**
 * Returns province options for the filter UI: distinct provinces from the
 * jobs collection, normalised case-insensitively (one entry per name in
 * canonical title-case) and sorted alphabetically.
 */
export async function getDistinctProvinceOptions(): Promise<string[]> {
  await connectDB();
  const provinces = (await Job.distinct("province")) as string[];
  const map = new Map<string, string>();
  for (const p of provinces) {
    if (!p) continue;
    const trimmed = p.trim();
    if (!trimmed || trimmed.toLowerCase() === "unknown") continue;
    const key = trimmed.toLowerCase();
    if (!map.has(key)) map.set(key, trimmed);
  }
  return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
}

/**
 * Returns distinct city options for the filter UI, optionally restricted to
 * a province (case-insensitive). Cities are deduped case-insensitively and
 * sorted alphabetically.
 */
export async function getDistinctCityOptions(
  province?: string,
): Promise<string[]> {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (province && province.trim()) {
    filter.province = {
      $regex: `^${escapeRegex(province.trim())}$`,
      $options: "i",
    };
  }
  const cities = (await Job.distinct("city", filter)) as string[];
  const map = new Map<string, string>();
  for (const c of cities) {
    if (!c) continue;
    const trimmed = c.trim();
    if (!trimmed || trimmed.toLowerCase() === "unknown") continue;
    const key = trimmed.toLowerCase();
    if (!map.has(key)) map.set(key, trimmed);
  }
  return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
}
