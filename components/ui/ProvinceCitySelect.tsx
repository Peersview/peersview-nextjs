"use client";

import { useController } from "react-hook-form";
import type { Control, FieldValues, Path } from "react-hook-form";
import { CA_PROVINCES, getCityOptionsForProvince } from "@/lib/canadaLocations";

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
  const {
    ref: provinceRef,
    value: provinceValue,
    onChange: onProvinceChange,
    ...provinceSelectProps
  } = provinceCtrl;

  const provinceName = provinceValue as string;
  const cityValue = cityCtrl.value as string;
  const cityOptions = getCityOptionsForProvince(provinceName, cityValue);

  function handleProvinceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onProvinceChange(e.target.value);
    cityCtrl.onChange("");
  }

  return (
    <>
      <SelectField label="Province" error={provinceError}>
        <select
          {...provinceSelectProps}
          ref={provinceRef}
          value={provinceName}
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
          value={cityValue}
          className="form-input"
          disabled={!provinceName}
        >
          <option value="">
            {!provinceName
              ? "Select a province first"
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
