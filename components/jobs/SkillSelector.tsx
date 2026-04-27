"use client";

import { useEffect, useMemo, useState } from "react";
import {
  skillCategories,
  getSkillsForCategory,
} from "@/data/skills-data";

const PAGE_SIZE = 15;

export interface SkillSelectorProps {
  /** Selected category (a.k.a. "core skill" / career path). */
  category?: string;
  /** Selected skill names. */
  value: string[];
  onCategoryChange: (category: string) => void;
  onChange: (skills: string[]) => void;
  categoryLabel?: string;
  skillsLabel?: string;
  categoryError?: string;
  skillsError?: string;
}

export function SkillSelector({
  category,
  value,
  onCategoryChange,
  onChange,
  categoryLabel = "Identify the Core Skill",
  skillsLabel = "Add the related skills",
  categoryError,
  skillsError,
}: SkillSelectorProps) {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);

  const skills = useMemo(
    () => (category ? getSkillsForCategory(category) : []),
    [category],
  );

  const maxPage = Math.max(1, Math.ceil(skills.length / PAGE_SIZE));
  const visibleSkills = useMemo(
    () => skills.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [skills, page],
  );

  useEffect(() => {
    setPage(1);
  }, [category]);

  function toggleSkill(name: string) {
    if (value.includes(name)) {
      onChange(value.filter((s) => s !== name));
    } else {
      onChange([...value, name]);
    }
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="block text-sm font-semibold text-gray-700 mb-1">
          {categoryLabel}
        </span>
        <select
          className="form-input"
          value={category ?? ""}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="" disabled>
            Select Career Path
          </option>
          {skillCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {categoryError && (
          <p className="text-xs text-red-500 mt-1">{categoryError}</p>
        )}
      </label>

      <div className="relative">
        <label className="block">
          <span className="block text-sm font-semibold text-gray-700 mb-1">
            {skillsLabel}
          </span>
          <input
            type="text"
            readOnly
            disabled={!category}
            value={value.join(", ")}
            placeholder={
              category ? "Click to choose skills" : "Pick a career path first"
            }
            onClick={() => setOpen((v) => !v)}
            className="form-input cursor-pointer"
          />
        </label>

        {open && category && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3">
            {visibleSkills.length === 0 ? (
              <p className="text-sm text-gray-500 p-2">No skills in this category</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-72 overflow-y-auto">
                {visibleSkills.map((skill) => {
                  const checked = value.includes(skill);
                  return (
                    <li key={skill}>
                      <label
                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition ${
                          checked
                            ? "bg-primary/10 text-primary font-semibold"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-primary"
                          checked={checked}
                          onChange={() => toggleSkill(skill)}
                        />
                        <span className="truncate">{skill}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="text-sm font-semibold text-primary disabled:text-gray-300"
              >
                ← Prev
              </button>
              <span className="text-xs text-gray-500">
                Page {page} of {maxPage}
              </span>
              <button
                type="button"
                disabled={page >= maxPage}
                onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                className="text-sm font-semibold text-primary disabled:text-gray-300"
              >
                Next →
              </button>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {skillsError && (
          <p className="text-xs text-red-500 mt-1">{skillsError}</p>
        )}
      </div>
    </div>
  );
}
