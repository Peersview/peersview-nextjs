"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { updateProfileSchema } from "@/schemas/auth.schema";
import { updateUserProfile } from "@/services/auth.service";
import type { ActionResult, IUser } from "@/types";

export async function updateProfileAction(
  input: unknown,
): Promise<ActionResult<IUser>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: { _form: ["You must be signed in"] } };
  }

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const user = await updateUserProfile(session.user.id, parsed.data);
    if (!user) return { error: { _form: ["User not found"] } };
    revalidatePath("/profile");
    return { data: user };
  } catch (err) {
    return { error: { _form: [(err as Error).message] } };
  }
}
