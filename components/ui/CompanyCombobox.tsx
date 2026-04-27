"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { searchCompaniesAction } from "@/app/actions/company";
import { cloudinaryUrl } from "@/lib/cloudinary";
import type { ICompany } from "@/types";

interface CompanyComboboxProps {
  value: string;
  onChange: (id: string) => void;
  /** User's own companies shown at the top, pre-selected if only one. */
  myCompanies: ICompany[];
  error?: string;
}

export function CompanyCombobox({
  value,
  onChange,
  myCompanies,
  error,
}: CompanyComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ICompany[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<ICompany | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Resolve selected company from initial value.
  useEffect(() => {
    if (!value) {
      setSelected(null);
      return;
    }
    const mine = myCompanies.find((c) => c._id === value);
    if (mine) {
      setSelected(mine);
      return;
    }
    // Not in myCompanies, try to find in results.
    const found = results.find((c) => c._id === value);
    if (found) setSelected(found);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Search with debounce.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchCompaniesAction(query);
        if (!cancelled) setResults(res);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open]);

  // Close on outside click.
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function pick(company: ICompany) {
    setSelected(company);
    onChange(company._id);
    setOpen(false);
    setQuery("");
  }

  function clear() {
    setSelected(null);
    onChange("");
    setQuery("");
  }

  // Deduplicate: show myCompanies at top, then search results excluding them.
  const myIds = new Set(myCompanies.map((c) => c._id));
  const others = results.filter((c) => !myIds.has(c._id));
  const allOptions = [...myCompanies, ...others];

  return (
    <div ref={panelRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className={`form-input flex items-center justify-between gap-2 text-left ${
          error ? "border-red-400" : ""
        }`}
      >
        {selected ? (
          <span className="flex items-center gap-2 min-w-0">
            {selected.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cloudinaryUrl(selected.logo, {
                  width: 48,
                  height: 48,
                  crop: "fill",
                })}
                alt=""
                className="w-6 h-6 rounded object-cover flex-shrink-0"
              />
            )}
            <span className="truncate font-medium">{selected.name}</span>
          </span>
        ) : (
          <span className="text-gray-400">Select a company…</span>
        )}
        <span className="flex items-center gap-1 flex-shrink-0">
          {selected && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation();
                  clear();
                }
              }}
              className="p-0.5 rounded hover:bg-gray-100"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </span>
          )}
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies…"
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
            />
            {searching && (
              <span className="text-xs text-gray-400">Loading…</span>
            )}
          </div>

          {/* Options */}
          <ul className="max-h-64 overflow-y-auto py-1">
            {allOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500 text-center">
                {searching ? "Searching…" : "No companies found"}
              </li>
            ) : (
              allOptions.map((c, idx) => {
                const isOwn = myIds.has(c._id);
                const showOwnHeader = idx === 0 && myCompanies.length > 0;
                const showOtherHeader =
                  !isOwn && (idx === 0 || myIds.has(allOptions[idx - 1]._id));
                const logoSrc = cloudinaryUrl(c.logo, {
                  width: 48,
                  height: 48,
                  crop: "fill",
                });
                return (
                  <li key={c._id}>
                    {showOwnHeader && (
                      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                        Your companies
                      </p>
                    )}
                    {showOtherHeader && (
                      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 mt-1 border-t border-gray-100 pt-2">
                        All companies
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => pick(c)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-primary/5 transition-colors ${
                        value === c._id ? "bg-primary/10 font-semibold" : ""
                      }`}
                    >
                      {logoSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoSrc}
                          alt=""
                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {c.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="truncate text-left">{c.name}</span>
                      {isOwn && (
                        <span className="ml-auto text-[10px] font-semibold text-primary bg-primary/10 rounded px-1.5 py-0.5 flex-shrink-0">
                          Yours
                        </span>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
