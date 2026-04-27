"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applyJobSchema, type ApplyJobInput } from "@/schemas/job.schema";
import { applyToJobAction } from "@/app/actions/application";

interface ApplyModalProps {
  jobId: string;
  jobTitle: string;
  isAuthenticated: boolean;
}

export function ApplyModal({
  jobId,
  jobTitle,
  isAuthenticated,
}: ApplyModalProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ApplyJobInput>({
    resolver: zodResolver(applyJobSchema),
    defaultValues: { jobId, resumeUrl: "", coverLetterUrl: "" },
  });

  function close() {
    setOpen(false);
    setSubmitted(false);
    setFormError(null);
    reset({ jobId, resumeUrl: "", coverLetterUrl: "" });
  }

  async function onSubmit(values: ApplyJobInput) {
    setFormError(null);
    const result = await applyToJobAction(values);
    if (result.error) {
      setFormError(
        result.error._form?.[0] ?? "Could not submit your application",
      );
      return;
    }
    setSubmitted(true);
  }

  if (!isAuthenticated) {
    return (
      <a href="/sign-in" className="btn-primary w-full sm:w-auto">
        Sign in to Apply
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary w-full sm:w-auto"
      >
        Apply
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-primary">
                Apply to {jobTitle}
              </h3>
              <button
                type="button"
                onClick={close}
                className="text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center">
                <p className="text-2xl">🎉</p>
                <p className="mt-3 text-lg font-semibold text-primary">
                  Application submitted!
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  The employer will be in touch soon.
                </p>
                <button onClick={close} className="btn-primary mt-6">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input type="hidden" {...register("jobId")} />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Resume URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("resumeUrl")}
                    type="url"
                    placeholder="https://..."
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.resumeUrl && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.resumeUrl.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Cover Letter URL (optional)
                  </label>
                  <input
                    {...register("coverLetterUrl")}
                    type="url"
                    placeholder="https://..."
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.coverLetterUrl && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.coverLetterUrl.message}
                    </p>
                  )}
                </div>

                {formError && (
                  <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                    {formError}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={close}
                    className="btn-secondary flex-1 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex-1 py-2"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
