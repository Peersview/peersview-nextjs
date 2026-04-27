"use server";

import { randomBytes } from "crypto";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signUpSchema,
} from "@/schemas/auth.schema";
import {
  createPasswordResetToken,
  registerUser,
  resetPasswordWithToken,
  verifyEmailToken,
} from "@/services/auth.service";
import { sendEmail } from "@/lib/email";
import { verificationEmail } from "@/lib/emails/verification";
import { resetPasswordEmail } from "@/lib/emails/resetPassword";
import type { ActionResult, IUser } from "@/types";

function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000"
  );
}

export async function registerAction(
  input: unknown,
): Promise<ActionResult<IUser>> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const { user, verificationToken } = await registerUser({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      password: parsed.data.password,
      role: parsed.data.role,
    });

    const verifyUrl = `${appUrl()}/verify-email?token=${verificationToken}`;
    try {
      await sendEmail(
        "Thanks for joining Peersview",
        user.email,
        verificationEmail(`${user.firstName} ${user.lastName}`, verifyUrl),
      );
    } catch (mailErr) {
      console.error("Verification email failed", mailErr);
    }

    return { data: user };
  } catch (err) {
    return { error: { _form: [(err as Error).message] } };
  }
}

export async function verifyEmailAction(
  token: string,
): Promise<ActionResult<IUser>> {
  if (!token) {
    return { error: { _form: ["Missing verification token"] } };
  }
  try {
    const user = await verifyEmailToken(token);
    if (!user) {
      return {
        error: {
          _form: ["This verification link is invalid or has expired."],
        },
      };
    }
    return { data: user };
  } catch (err) {
    return { error: { _form: [(err as Error).message] } };
  }
}

export async function forgotPasswordAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const result = await createPasswordResetToken(parsed.data.email);
    // Always return success to avoid leaking which emails exist.
    if (result) {
      const resetUrl = `${appUrl()}/reset-password?token=${result.resetToken}`;
      try {
        await sendEmail(
          "Reset your Peersview password",
          result.user.email,
          resetPasswordEmail(
            `${result.user.firstName} ${result.user.lastName}`,
            resetUrl,
          ),
        );
      } catch (mailErr) {
        console.error("Reset email failed", mailErr);
      }
    }
    return { data: { ok: true } };
  } catch (err) {
    return { error: { _form: [(err as Error).message] } };
  }
}

export async function resendVerificationAction(
  email: string,
): Promise<ActionResult<{ ok: true }>> {
  if (!email) {
    return { error: { _form: ["Please enter your email"] } };
  }
  try {
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return success to avoid leaking which emails exist.
    if (user && !user.emailVerified) {
      const token = randomBytes(32).toString("hex");
      user.emailVerificationToken = token;
      user.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();
      const verifyUrl = `${appUrl()}/verify-email?token=${token}`;
      try {
        await sendEmail(
          "Thanks for joining Peersview",
          user.email,
          verificationEmail(`${user.firstName} ${user.lastName}`, verifyUrl),
        );
      } catch (mailErr) {
        console.error("Resend verification failed", mailErr);
      }
    }
    return { data: { ok: true } };
  } catch (err) {
    return { error: { _form: [(err as Error).message] } };
  }
}

export async function resetPasswordAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const ok = await resetPasswordWithToken(
      parsed.data.token,
      parsed.data.password,
    );
    if (!ok) {
      return {
        error: { _form: ["This reset link is invalid or has expired."] },
      };
    }
    return { data: { ok: true } };
  } catch (err) {
    return { error: { _form: [(err as Error).message] } };
  }
}
