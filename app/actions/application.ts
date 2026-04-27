"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { applyJobSchema } from "@/schemas/job.schema";
import { applyToJob } from "@/services/jobApplication.service";
import type { ActionResult, IJobApplication } from "@/types";

export async function applyToJobAction(
  input: unknown,
): Promise<ActionResult<IJobApplication>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: { _form: ["You must be signed in to apply"] } };
  }

  const parsed = applyJobSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const application = await applyToJob(session.user.id, parsed.data);
    revalidatePath(`/jobs/${parsed.data.jobId}`);
    return { data: application };
  } catch (err) {
    return { error: { _form: [(err as Error).message] } };
  }
}
