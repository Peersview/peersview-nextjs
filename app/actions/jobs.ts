"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createJobSchema, type JobFilters } from "@/schemas/job.schema";
import {
  createJob,
  getDistinctCityOptions,
  getJobById,
  getJobs,
  getJobsPaginated,
  type PaginatedJobs,
} from "@/services/job.service";
import { getSavedJobIds } from "@/services/savedJob.service";
import type { ActionResult, IJob } from "@/types";

export async function fetchJobsAction(filters?: JobFilters): Promise<IJob[]> {
  return getJobs(filters ?? {});
}

export async function fetchCityOptionsAction(
  province?: string,
): Promise<string[]> {
  return getDistinctCityOptions(province);
}

export async function fetchJobsPageAction(
  filters: JobFilters,
  page: number,
  limit = 12,
): Promise<PaginatedJobs & { savedIds: string[] }> {
  const [result, session] = await Promise.all([
    getJobsPaginated(filters, { page, limit }),
    auth(),
  ]);
  const savedIds = session?.user?.id
    ? Array.from(await getSavedJobIds(session.user.id))
    : [];
  return { ...result, savedIds };
}

export async function fetchJobByIdAction(id: string): Promise<IJob | null> {
  return getJobById(id);
}

export async function createJobAction(
  input: unknown,
): Promise<ActionResult<IJob>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: { _form: ["You must be signed in to post a job"] } };
  }
  if (session.user.role !== "employer") {
    return { error: { _form: ["Only employers can post a job"] } };
  }

  const parsed = createJobSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const job = await createJob(session.user.id, parsed.data);
    revalidatePath("/jobs");
    return { data: job };
  } catch (err) {
    return { error: { _form: [(err as Error).message] } };
  }
}
