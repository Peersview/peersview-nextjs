"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Filter, X } from "lucide-react";
import { skillCategories } from "@/data/skills-data";
import { fetchCityOptionsAction } from "@/app/actions/jobs";

const JOB_TYPES = [
  { value: "full-time", label: "Full-Time" },
  { value: "part-time", label: "Part-Time" },
  { value: "internship", label: "Internship" },
  { value: "graduate", label: "Graduate Role" },
  { value: "co-op", label: "Co-op" },
];

interface JobFiltersProps {
  provinceOptions?: string[];
}

export function JobFilters({ provinceOptions = [] }: JobFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const current = useMemo(
    () => ({
      q: params.get("q") ?? "",
      type: params.get("type") ?? "",
      province: params.get("province") ?? "",
      city: params.get("city") ?? "",
      industry: params.get("industry") ?? "",
      company: params.get("company") ?? "",
      workAuth: params.get("workAuth") === "1",
    }),
    [params],
  );

  const [draft, setDraft] = useState(current);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!draft.province) {
      setCityOptions([]);
      return;
    }
    setLoadingCities(true);
    fetchCityOptionsAction(draft.province)
      .then((cities) => {
        if (!cancelled) setCityOptions(cities);
      })
      .catch((err) => {
        console.error("[filters] failed to load cities:", err);
        if (!cancelled) setCityOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false);
      });
    return () => {
      cancelled = true;
    };
  }, [draft.province]);

  function update<K extends keyof typeof draft>(
    key: K,
    value: (typeof draft)[K],
  ) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function apply() {
    const sp = new URLSearchParams();
    if (draft.q) sp.set("q", draft.q);
    if (draft.type) sp.set("type", draft.type);
    if (draft.province) sp.set("province", draft.province);
    if (draft.city) sp.set("city", draft.city);
    if (draft.industry) sp.set("industry", draft.industry);
    if (draft.company) sp.set("company", draft.company);
    if (draft.workAuth) sp.set("workAuth", "1");
    const qs = sp.toString();
    router.push(qs ? `/jobs?${qs}` : "/jobs");
    setOpen(false);
  }

  function clear() {
    const empty = {
      q: "",
      type: "",
      province: "",
      city: "",
      industry: "",
      company: "",
      workAuth: false,
    };
    setDraft(empty);
    router.push("/jobs");
    setOpen(false);
  }

  const activeCount = [
    current.type,
    current.province,
    current.city,
    current.industry,
    current.company,
    current.workAuth ? "1" : "",
  ].filter(Boolean).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:border-primary"
      >
        <Filter className="w-4 h-4" />
        Filters
        {activeCount > 0 && (
          <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary text-white text-xs px-2 py-0.5">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-stretch justify-end"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white h-full overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">Filter Jobs</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <Field label="Job Type">
                <select
                  className="form-input"
                  value={draft.type}
                  onChange={(e) => update("type", e.target.value)}
                >
                  <option value="">Any</option>
                  {JOB_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Province">
                <select
                  className="form-input"
                  value={draft.province}
                  onChange={(e) => {
                    update("province", e.target.value);
                    update("city", "");
                  }}
                >
                  <option value="">Any province</option>
                  {provinceOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="City">
                <select
                  className="form-input"
                  value={draft.city}
                  onChange={(e) => update("city", e.target.value)}
                  disabled={!draft.province || loadingCities}
                >
                  <option value="">
                    {!draft.province
                      ? "Select a province first"
                      : loadingCities
                        ? "Loading cities..."
                        : cityOptions.length === 0
                          ? "No cities found"
                          : "Any city"}
                  </option>
                  {cityOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Industry">
                <select
                  className="form-input"
                  value={draft.industry}
                  onChange={(e) => update("industry", e.target.value)}
                >
                  <option value="">Any industry</option>
                  {skillCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Company Name">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Acme"
                  value={draft.company}
                  onChange={(e) => update("company", e.target.value)}
                />
              </Field>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={draft.workAuth}
                  onChange={(e) => update("workAuth", e.target.checked)}
                  className="accent-primary"
                />
                Open to international students
              </label>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={clear}
                className="btn-secondary flex-1"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={apply}
                className="btn-primary flex-1"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
