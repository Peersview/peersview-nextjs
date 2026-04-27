"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createJobSchema, type CreateJobInput } from "@/schemas/job.schema";
import { createJobAction } from "@/app/actions/jobs";
import { ProvinceCitySelect } from "@/components/ui/ProvinceCitySelect";
import { SkillSelector } from "@/components/jobs/SkillSelector";
import { CompanyCombobox } from "@/components/ui/CompanyCombobox";
import { skillCategories } from "@/data/skills-data";
import type { ICompany } from "@/types";

type CreateJobFormValues = z.input<typeof createJobSchema>;

const jobTypes: { value: CreateJobInput["type"]; label: string }[] = [
  { value: "full-time", label: "Full-Time" },
  { value: "part-time", label: "Part-Time" },
  { value: "internship", label: "Internship" },
  { value: "graduate", label: "Graduate Role" },
  { value: "co-op", label: "Co-op" },
];


interface PostJobFormProps {
  myCompanies: ICompany[];
}

export function PostJobForm({ myCompanies }: PostJobFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const defaultCompany = myCompanies[0];

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateJobFormValues, unknown, CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      companyId: defaultCompany?._id ?? "",
      type: "full-time",
      currency: "CAD",
      experience: "",
      sourceLink: "",
      coreSkills: "",
      multipleSkills: "",
      industry: defaultCompany?.industry ?? "",
      country: "CA",
    },
  });

  async function onSubmit(values: CreateJobInput) {
    setFormError(null);
    const result = await createJobAction(values);
    if (result.error) {
      setFormError(result.error._form?.[0] ?? "Could not create job");
      return;
    }
    router.push(`/jobs/${result.data._id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Company */}
      <Field label="Company *" error={errors.companyId?.message}>
        <Controller
          control={control}
          name="companyId"
          render={({ field }) => (
            <CompanyCombobox
              value={field.value as string}
              onChange={field.onChange}
              myCompanies={myCompanies}
              error={errors.companyId?.message}
            />
          )}
        />
      </Field>

      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Job Title *" error={errors.title?.message}>
          <input
            {...register("title")}
            className="form-input"
            placeholder="Senior Engineer"
          />
        </Field>
        <Field label="Job Type *" error={errors.type?.message}>
          <select {...register("type")} className="form-input">
            {jobTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Industry *" error={errors.industry?.message}>
        <select {...register("industry")} className="form-input">
          <option value="">Select an industry</option>
          {skillCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Job Description *" error={errors.jobFunction?.message}>
        <textarea
          {...register("jobFunction")}
          rows={6}
          className="form-input"
          placeholder="Describe the role, responsibilities, and requirements"
        />
      </Field>

      <input type="hidden" {...register("country")} value="CA" />

      <div className="grid md:grid-cols-2 gap-5">
        <ProvinceCitySelect
          control={control}
          provinceField="province"
          cityField="city"
          provinceError={errors.province?.message}
          cityError={errors.city?.message}
        />
      </div>

      {/* Salary + Deadline */}
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Salary / Pay *" error={errors.price?.message}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold pointer-events-none select-none">
              $
            </span>
            <input
              {...register("price")}
              className="form-input pl-7"
              placeholder="e.g. 60,000/yr or 25/hr"
            />
          </div>
        </Field>

        <Field
          label="Application Deadline *"
          error={errors.deadline?.message as string}
        >
          <input
            type="date"
            {...register("deadline")}
            className="form-input"
          />
        </Field>
      </div>

      <input type="hidden" {...register("currency")} value="$" />

      {/* Skills */}
      <Controller
        control={control}
        name="coreSkills"
        render={({ field: coreField }) => (
          <Controller
            control={control}
            name="multipleSkills"
            render={({ field: multipleField }) => {
              const selected =
                typeof multipleField.value === "string" && multipleField.value
                  ? multipleField.value.split(",").map((s) => s.trim()).filter(Boolean)
                  : [];
              return (
                <SkillSelector
                  category={coreField.value || ""}
                  value={selected}
                  onCategoryChange={(c) => {
                    coreField.onChange(c);
                    multipleField.onChange("");
                  }}
                  onChange={(skills) => multipleField.onChange(skills.join(","))}
                  categoryError={errors.coreSkills?.message}
                  skillsError={errors.multipleSkills?.message}
                />
              );
            }}
          />
        )}
      />

      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Contact *" error={errors.contact?.message}>
          <input
            {...register("contact")}
            className="form-input"
            placeholder="hr@company.com"
          />
        </Field>
        <Field
          label="External Application URL (optional)"
          error={errors.sourceLink?.message}
        >
          <input
            {...register("sourceLink")}
            className="form-input"
            placeholder="https://company.com/jobs/123"
          />
        </Field>
      </div>

      {formError && (
        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
          {formError}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.push("/jobs")}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Posting..." : "Post Job"}
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
    <label className="block">
      <span className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </span>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </label>
  );
}
