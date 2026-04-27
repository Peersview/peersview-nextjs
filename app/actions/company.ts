"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  createCompanySchema,
  updateCompanySchema,
} from "@/schemas/company.schema";
import {
  createCompany,
  updateCompany,
  getCompaniesByUser,
  searchCompanies,
} from "@/services/company.service";
import type { ActionResult, ICompany } from "@/types";

export async function createCompanyAction(
  input: unknown,
): Promise<ActionResult<ICompany>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: { _form: ["You must be signed in"] } };
  }
  if (session.user.role !== "employer") {
    return { error: { _form: ["Only employers can add a company"] } };
  }

  const parsed = createCompanySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const company = await createCompany(session.user.id, parsed.data);
    revalidatePath("/jobs/post");
    revalidatePath("/company/add");
    return { data: company };
  } catch (err) {
    return { error: { _form: [(err as Error).message] } };
  }
}

export async function updateCompanyAction(
  companyId: string,
  input: unknown,
): Promise<ActionResult<ICompany>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: { _form: ["You must be signed in"] } };
  }
  if (session.user.role !== "employer") {
    return { error: { _form: ["Only employers can edit a company"] } };
  }

  const parsed = updateCompanySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const company = await updateCompany(companyId, session.user.id, parsed.data);
    revalidatePath("/company/add");
    revalidatePath("/jobs/post");
    revalidatePath(`/company/${companyId}/edit`);
    return { data: company };
  } catch (err) {
    return { error: { _form: [(err as Error).message] } };
  }
}

export async function fetchEmployerCompaniesAction(): Promise<ICompany[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return getCompaniesByUser(session.user.id);
}

export async function searchCompaniesAction(
  query: string,
): Promise<ICompany[]> {
  return searchCompanies(query, 30);
}
