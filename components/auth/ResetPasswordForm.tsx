"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/schemas/auth.schema";
import { resetPasswordAction } from "@/app/actions/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-red-600">
          The reset link is missing a token. Please request a new one.
        </p>
        <Link href="/forgot-password" className="btn-primary inline-block">
          Request new link
        </Link>
      </div>
    );
  }

  async function onSubmit(values: ResetPasswordInput) {
    setFormError(null);
    const r = await resetPasswordAction(values);
    if (r.error) {
      const first = Object.values(r.error).flat().find(Boolean);
      setFormError(first ?? "Could not reset password");
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/sign-in"), 1500);
  }

  if (success) {
    return (
      <div className="text-center space-y-3">
        <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
          Password reset! Redirecting to sign in…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("token")} />

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          New Password
        </label>
        <input
          {...register("password")}
          type="password"
          autoComplete="new-password"
          className="form-input"
          placeholder="At least 8 characters"
        />
        {errors.password && (
          <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Confirm New Password
        </label>
        <input
          {...register("confirmPassword")}
          type="password"
          autoComplete="new-password"
          className="form-input"
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-500 mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {formError && (
        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full"
      >
        {isSubmitting ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}
