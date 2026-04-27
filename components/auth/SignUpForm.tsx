"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpInput } from "@/schemas/auth.schema";
import { registerAction } from "@/app/actions/auth";
import type { z } from "zod";

type SignUpFormInput = z.input<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormInput, unknown, SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: "user",
    },
  });

  const role = watch("role");

  async function onSubmit(values: SignUpInput) {
    setFormError(null);
    setSuccess(null);
    const result = await registerAction(values);
    if (result.error) {
      const firstFieldError = Object.values(result.error)
        .flat()
        .find(Boolean);
      setFormError(firstFieldError ?? "Could not create your account");
      return;
    }

    setSuccess(
      "Account created! Check your email for a verification link before signing in.",
    );
    setTimeout(() => router.push("/sign-in"), 1800);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          I am a <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <RoleOption
            label="Job Seeker"
            description="Find jobs"
            active={role === "user"}
            onClick={() => setValue("role", "user", { shouldValidate: true })}
          />
          <RoleOption
            label="Employer"
            description="Post jobs"
            active={role === "employer"}
            onClick={() =>
              setValue("role", "employer", { shouldValidate: true })
            }
          />
        </div>
        <input type="hidden" {...register("role")} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("firstName")}
            className="form-input"
            placeholder="Jane"
          />
          {errors.firstName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Surname <span className="text-red-500">*</span>
          </label>
          <input
            {...register("lastName")}
            className="form-input"
            placeholder="Doe"
          />
          {errors.lastName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
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
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Password <span className="text-red-500">*</span>
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
          Confirm Password <span className="text-red-500">*</span>
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

      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input
          {...register("hasAgreed")}
          type="checkbox"
          className="mt-1"
        />
        <span>
          I agree to the Terms &amp; Conditions, Privacy Policy and Code of
          Conduct
        </span>
      </label>
      {errors.hasAgreed && (
        <p className="text-xs text-red-500 -mt-2">
          {errors.hasAgreed.message as string}
        </p>
      )}

      {formError && (
        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
          {formError}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full"
      >
        {isSubmitting ? "Creating account..." : "Sign Up"}
      </button>

      <p className="text-center text-sm text-gray-600 pt-2">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-primary font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

function RoleOption({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start rounded-lg border-2 px-4 py-3 text-left transition ${
        active
          ? "border-primary bg-primary/5"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <span className="font-semibold text-gray-900">{label}</span>
      <span className="text-xs text-gray-500">{description}</span>
    </button>
  );
}
