"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInInput } from "@/schemas/auth.schema";
import { resendVerificationAction } from "@/app/actions/auth";

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";
  const [formError, setFormError] = useState<string | null>(null);
  const [showResend, setShowResend] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(values: SignInInput) {
    setFormError(null);
    setShowResend(null);
    setResendNotice(null);

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      setFormError(
        "Invalid email or password. If you just signed up, please verify your email first.",
      );
      setShowResend(values.email);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  async function handleResend() {
    if (!showResend) return;
    const r = await resendVerificationAction(showResend);
    if (r.error) {
      setResendNotice(r.error._form?.[0] ?? "Could not resend email");
      return;
    }
    setResendNotice(
      "If your account exists and is not yet verified, a new email has been sent.",
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

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-semibold text-gray-700">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <input
          {...register("password")}
          type="password"
          autoComplete="current-password"
          className="form-input"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      {formError && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg space-y-2">
          <p>{formError}</p>
          {showResend && (
            <button
              type="button"
              onClick={handleResend}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Resend verification email
            </button>
          )}
        </div>
      )}

      {resendNotice && (
        <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
          {resendNotice}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full"
      >
        {isSubmitting ? "Signing in..." : "Login"}
      </button>

      <p className="text-center text-sm text-gray-600 pt-4">
        Don&rsquo;t have an account?{" "}
        <Link href="/sign-up" className="text-primary font-semibold hover:underline">
          Sign up here
        </Link>
      </p>
    </form>
  );
}
