import { City, State } from "country-state-city";

export interface ProvinceOption {
  name: string;
  isoCode: string;
}

export const CA_PROVINCES: ProvinceOption[] = State.getStatesOfCountry("CA")
  .map((province) => ({
    name: province.name,
    isoCode: province.isoCode,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const CA_PROVINCE_NAMES = CA_PROVINCES.map((province) => province.name);

const provinceLookup = new Map<string, ProvinceOption>();

for (const province of CA_PROVINCES) {
  provinceLookup.set(province.name.toLowerCase(), province);
  provinceLookup.set(province.isoCode.toLowerCase(), province);
}

export function getCityOptionsForProvince(
  province?: string,
  selectedCity?: string,
): string[] {
  const trimmedProvince = province?.trim().toLowerCase();
  if (!trimmedProvince) return [];

  const provinceOption = provinceLookup.get(trimmedProvince);
  if (!provinceOption) {
    return selectedCity?.trim() ? [selectedCity.trim()] : [];
  }

  const cityMap = new Map<string, string>();

  for (const city of City.getCitiesOfState("CA", provinceOption.isoCode)) {
    const name = city.name.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (!cityMap.has(key)) cityMap.set(key, name);
  }

  const trimmedSelectedCity = selectedCity?.trim();
  if (trimmedSelectedCity) {
    const key = trimmedSelectedCity.toLowerCase();
    if (!cityMap.has(key)) cityMap.set(key, trimmedSelectedCity);
  }

  return Array.from(cityMap.values()).sort((a, b) => a.localeCompare(b));
}
