import { z } from "zod";

const companyFields = z.object({
  name: z.string().min(1, "Company name is required").max(120),
  logo: z.string().optional().or(z.literal("")),
  bio: z
    .string()
    .max(1024, "Max 1024 characters")
    .optional()
    .or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  country: z.string().default("CA"),
  province: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
});

export const createCompanySchema = companyFields;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const updateCompanySchema = companyFields;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
