import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Company, type CompanyDocument } from "@/models/Company";
import type { ICompany } from "@/types";

function serialize(doc: CompanyDocument): ICompany {
  return {
    _id: String(doc._id),
    userId: String(doc.userId),
    name: doc.name,
    logo: doc.logo,
    bio: doc.bio,
    industry: doc.industry,
    country: doc.country,
    province: doc.province,
    city: doc.city,
    createdAt: doc.createdAt,
  };
}

export interface CreateCompanyInput {
  name: string;
  logo?: string;
  bio?: string;
  industry?: string;
  country?: string;
  province?: string;
  city?: string;
}

export type UpdateCompanyInput = Partial<CreateCompanyInput> & {
  name: string;
};

export async function createCompany(
  userId: string,
  input: CreateCompanyInput,
): Promise<ICompany> {
  await connectDB();

  const existing = (await Company.findOne({
    name: { $regex: `^${escapeRegex(input.name)}$`, $options: "i" },
  }).lean()) as unknown as CompanyDocument | null;
  if (existing) {
    throw new Error("A company with this name already exists");
  }

  const created = await Company.create({
    userId: new Types.ObjectId(userId),
    name: input.name,
    logo: input.logo || undefined,
    bio: input.bio || undefined,
    industry: input.industry || undefined,
    country: input.country || undefined,
    province: input.province || undefined,
    city: input.city || undefined,
  });
  return serialize(created.toObject() as unknown as CompanyDocument);
}

export async function updateCompany(
  companyId: string,
  userId: string,
  input: UpdateCompanyInput,
): Promise<ICompany> {
  await connectDB();

  const doc = (await Company.findById(companyId).lean()) as unknown as
    | CompanyDocument
    | null;
  if (!doc) throw new Error("Company not found");
  if (String(doc.userId) !== userId)
    throw new Error("Not authorised to edit this company");

  // Check name uniqueness only if it changed.
  if (input.name.toLowerCase() !== doc.name.toLowerCase()) {
    const clash = (await Company.findOne({
      name: { $regex: `^${escapeRegex(input.name)}$`, $options: "i" },
      _id: { $ne: new Types.ObjectId(companyId) },
    } as Record<string, unknown>).lean()) as unknown as CompanyDocument | null;
    if (clash) throw new Error("A company with this name already exists");
  }

  const updated = (await Company.findByIdAndUpdate(
    companyId,
    {
      $set: {
        name: input.name,
        logo: input.logo || undefined,
        bio: input.bio || undefined,
        industry: input.industry || undefined,
        country: input.country || undefined,
        province: input.province || undefined,
        city: input.city || undefined,
      },
    },
    { new: true },
  ).lean()) as unknown as CompanyDocument;

  return serialize(updated);
}

export async function getCompaniesByUser(
  userId: string,
): Promise<ICompany[]> {
  await connectDB();
  const docs = (await Company.find({
    userId: new Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .lean()) as unknown as CompanyDocument[];
  return docs.map(serialize);
}

export async function getCompanyById(id: string): Promise<ICompany | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDB();
  const doc = (await Company.findById(id).lean()) as unknown as
    | CompanyDocument
    | null;
  if (!doc) return null;
  return serialize(doc);
}

/**
 * Search companies by name (case-insensitive substring). Used for the
 * searchable company dropdown when posting a job.
 */
export async function searchCompanies(
  query: string,
  limit = 30,
): Promise<ICompany[]> {
  await connectDB();
  const filter = query.trim()
    ? { name: { $regex: escapeRegex(query.trim()), $options: "i" } }
    : {};
  const docs = (await Company.find(filter)
    .sort({ name: 1 })
    .limit(limit)
    .lean()) as unknown as CompanyDocument[];
  return docs.map(serialize);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
