"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  createCompanySchema,
  type CreateCompanyInput,
} from "@/schemas/company.schema";

type CompanyFormValues = z.input<typeof createCompanySchema>;
import { createCompanyAction, updateCompanyAction } from "@/app/actions/company";
import { CloudinaryUploader } from "@/components/ui/CloudinaryUploader";
import { skillCategories } from "@/data/skills-data";
import { CA_PROVINCE_NAMES, getCityOptionsForProvince } from "@/lib/canadaLocations";
import type { ICompany } from "@/types";

interface CompanyFormProps {
  /** When provided the form is in edit mode */
  company?: ICompany;
}

export function CompanyForm({ company }: CompanyFormProps) {
  const router = useRouter();
  const isEdit = !!company;
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormValues, unknown, CreateCompanyInput>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: company?.name ?? "",
      logo: company?.logo ?? "",
      bio: company?.bio ?? "",
      industry: company?.industry ?? "",
      country: "CA",
      province: company?.province ?? "",
      city: company?.city ?? "",
    },
  });

  const selectedProvince = watch("province");
  const selectedCity = watch("city");
  const cityOptions = useMemo(
    () => getCityOptionsForProvince(selectedProvince, selectedCity),
    [selectedProvince, selectedCity],
  );
  const provinceField = register("province");

  async function onSubmit(values: CreateCompanyInput) {
    setFormError(null);
    setSuccess(false);

    const r = isEdit
      ? await updateCompanyAction(company._id, values)
      : await createCompanyAction(values);

    if (r.error) {
      const first = Object.values(r.error).flat().find(Boolean);
      setFormError(first ?? "Could not save company");
      return;
    }

    setSuccess(true);
    if (!isEdit) reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field label="Company Logo">
        <Controller
          control={control}
          name="logo"
          render={({ field }) => (
            <CloudinaryUploader
              value={field.value || ""}
              onChange={field.onChange}
              folder="peersview/company-logos"
              label="Upload logo"
            />
          )}
        />
      </Field>

      <Field label="Company Name *" error={errors.name?.message}>
        <input
          {...register("name")}
          className="form-input"
          placeholder="Acme Inc."
        />
      </Field>

      <Field label="Industry" error={errors.industry?.message}>
        <select {...register("industry")} className="form-input">
          <option value="">Select an industry</option>
          {skillCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <input type="hidden" {...register("country")} value="CA" />

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Province" error={errors.province?.message}>
          <select
            {...provinceField}
            onChange={(e) => {
              provinceField.onChange(e);
              setValue("city", "");
            }}
            className="form-input"
          >
            <option value="">Select province</option>
            {CA_PROVINCE_NAMES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>

        <Field label="City" error={errors.city?.message}>
          <select
            {...register("city")}
            className="form-input"
            disabled={!selectedProvince}
          >
            <option value="">
              {!selectedProvince
                ? "Select province first"
                : cityOptions.length === 0
                  ? "No cities found"
                  : "Select city"}
            </option>
            {cityOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Brief Company Bio" error={errors.bio?.message}>
        <textarea
          {...register("bio")}
          rows={4}
          className="form-input"
          placeholder="Tell candidates about your company"
          maxLength={1024}
        />
      </Field>

      {formError && (
        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
          {formError}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
          Company {isEdit ? "updated" : "added"} successfully.
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push(isEdit ? "/company/add" : "/jobs/post")}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Saving..." : isEdit ? "Update Company" : "Save Company"}
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
