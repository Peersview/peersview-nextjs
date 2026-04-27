"use client";

import { useEffect, useState } from "react";
import { useController } from "react-hook-form";
import type { Control, FieldValues, Path } from "react-hook-form";
import { State } from "country-state-city";
import { fetchCityOptionsAction } from "@/app/actions/jobs";

// Province list from country-state-city, but we store the full NAME in DB.
const CA_PROVINCES = State.getStatesOfCountry("CA").map((p) => ({
  name: p.name,     // stored in DB  e.g. "Ontario"
  isoCode: p.isoCode, // used only for display ordering
}));

interface ProvinceCitySelectProps<T extends FieldValues> {
  control: Control<T>;
  provinceField: Path<T>;
  cityField: Path<T>;
  provinceError?: string;
  cityError?: string;
}

export function ProvinceCitySelect<T extends FieldValues>({
  control,
  provinceField,
  cityField,
  provinceError,
  cityError,
}: ProvinceCitySelectProps<T>) {
  const { field: provinceCtrl } = useController({ control, name: provinceField });
  const { field: cityCtrl } = useController({ control, name: cityField });

  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  const provinceName = provinceCtrl.value as string;

  useEffect(() => {
    let cancelled = false;
    if (!provinceName) {
      setCityOptions([]);
      return;
    }
    setLoadingCities(true);
    fetchCityOptionsAction(provinceName)
      .then((cities) => { if (!cancelled) setCityOptions(cities); })
      .catch(() => { if (!cancelled) setCityOptions([]); })
      .finally(() => { if (!cancelled) setLoadingCities(false); });
    return () => { cancelled = true; };
  }, [provinceName]);

  function handleProvinceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    provinceCtrl.onChange(e.target.value);
    cityCtrl.onChange("");
  }

  return (
    <>
      <SelectField label="Province" error={provinceError}>
        <select
          ref={provinceCtrl.ref}
          name={provinceCtrl.name}
          value={provinceName}
          onBlur={provinceCtrl.onBlur}
          onChange={handleProvinceChange}
          className="form-input"
        >
          <option value="">Select a province</option>
          {CA_PROVINCES.map((p) => (
            <option key={p.isoCode} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </SelectField>

      <SelectField label="City" error={cityError}>
        <select
          {...cityCtrl}
          value={cityCtrl.value as string}
          className="form-input"
          disabled={!provinceName || loadingCities}
        >
          <option value="">
            {!provinceName
              ? "Select a province first"
              : loadingCities
                ? "Loading cities…"
                : cityOptions.length === 0
                  ? "No cities found"
                  : "Select a city"}
          </option>
          {cityOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </SelectField>
    </>
  );
}

function SelectField({
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
