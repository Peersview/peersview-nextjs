"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { saveJob, unsaveJob } from "@/services/savedJob.service";
import type { ActionResult } from "@/types";

export async function saveJobAction(
  jobId: string,
): Promise<ActionResult<{ ok: true }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: { _form: ["AUTH_REQUIRED"] } };
  }
  try {
    await saveJob(session.user.id, jobId);
    revalidatePath("/jobs");
    revalidatePath("/saved-jobs");
    return { data: { ok: true } };
  } catch (err) {
    return { error: { _form: [(err as Error).message] } };
  }
}

export async function unsaveJobAction(
  jobId: string,
): Promise<ActionResult<{ ok: true }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: { _form: ["AUTH_REQUIRED"] } };
  }
  try {
    await unsaveJob(session.user.id, jobId);
    revalidatePath("/jobs");
    revalidatePath("/saved-jobs");
    return { data: { ok: true } };
  } catch (err) {
    return { error: { _form: [(err as Error).message] } };
  }
}
