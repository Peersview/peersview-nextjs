"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/schemas/auth.schema";
import { updateProfileAction } from "@/app/actions/profile";
import { CloudinaryUploader } from "@/components/ui/CloudinaryUploader";
import type { IUser } from "@/types";

interface ProfileFormProps {
  user: IUser;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture ?? "",
    },
  });

  async function onSubmit(values: UpdateProfileInput) {
    setFormError(null);
    setSuccess(false);
    const r = await updateProfileAction(values);
    if (r.error) {
      const first = Object.values(r.error).flat().find(Boolean);
      setFormError(first ?? "Could not update profile");
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Field label="Profile Picture">
        <Controller
          control={control}
          name="profilePicture"
          render={({ field }) => (
            <CloudinaryUploader
              value={field.value || ""}
              onChange={field.onChange}
              folder="peersview/avatars"
              shape="circle"
              size={96}
              label="Upload photo"
            />
          )}
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="First Name *" error={errors.firstName?.message}>
          <input {...register("firstName")} className="form-input" />
        </Field>
        <Field label="Surname *" error={errors.lastName?.message}>
          <input {...register("lastName")} className="form-input" />
        </Field>
      </div>

      <Field label="Email">
        <input
          value={user.email}
          disabled
          readOnly
          className="form-input bg-gray-50 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 mt-1">
          Email cannot be changed. Contact support to update your email.
        </p>
      </Field>

      <Field label="Account Type">
        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
          {user.role === "employer" ? "Employer" : "Job Seeker"}
        </div>
      </Field>

      {formError && (
        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
          {formError}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
          Profile updated successfully.
        </p>
      )}

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <span className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </span>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
