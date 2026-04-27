"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/schemas/auth.schema";
import { forgotPasswordAction } from "@/app/actions/auth";

export function ForgotPasswordForm() {
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setFormError(null);
    const r = await forgotPasswordAction(values);
    if (r.error) {
      setFormError(r.error._form?.[0] ?? "Could not process request");
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-gray-700">
          If an account exists for that email, a password reset link has been
          sent.
        </p>
        <Link
          href="/sign-in"
          className="btn-primary inline-block text-sm"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          autoComplete="email"
          className="form-input"
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
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
        {isSubmitting ? "Sending..." : "Send Reset Link"}
      </button>

      <p className="text-center text-sm text-gray-600">
        <Link href="/sign-in" className="text-primary font-semibold hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
