import Link from "next/link";
import type { IJob } from "@/types";
import { Briefcase, MapPin } from "lucide-react";
import { SaveJobButton } from "./SaveJobButton";
import { cloudinaryUrl, formatLocation, formatDate } from "@/lib/cloudinary";

const typeLabels: Record<IJob["type"], string> = {
  "full-time": "Full-Time",
  "part-time": "Part-Time",
  internship: "Internship",
  graduate: "Graduate Role",
  "co-op": "Co-op",
};

function splitSkills(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

interface JobCardProps {
  job: IJob;
  isSaved?: boolean;
  showSave?: boolean;
}

export function JobCard({ job, isSaved = false, showSave = true }: JobCardProps) {
  const coreSkill = (job.coreSkills ?? "").trim();
  const subSkills = splitSkills(job.multipleSkills);
  const deadline = formatDate(job.deadline);
  const logoSrc = cloudinaryUrl(job.companyLogo, {
    width: 96,
    height: 96,
    crop: "fill",
  });
  const locationLabel =
    [formatLocation(job.city), formatLocation(job.province)]
      .filter(Boolean)
      .join(", ") || formatLocation(job.country);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-primary/20 transition flex flex-col">
      <div className="flex items-start gap-3">
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoSrc}
            alt={`${job.company} logo`}
            className="w-12 h-12 rounded-lg object-cover bg-gray-50 border border-gray-100"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            {initials(job.company || "P")}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-gray-900 truncate">
            {job.company}
          </h3>
          {deadline && (
            <p className="text-xs text-gray-500">Apply by {deadline}</p>
          )}
        </div>
      </div>

      <h2 className="mt-4 text-xl font-bold text-primary leading-snug">
        {job.title}
      </h2>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
        <span className="inline-flex items-center gap-1.5">
          <Briefcase className="w-4 h-4 text-secondary" />
          {typeLabels[job.type]}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-secondary" />
          {locationLabel}
        </span>
      </div>

      {(coreSkill || subSkills.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {coreSkill && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent text-white text-xs font-semibold">
              {coreSkill}
            </span>
          )}
          {subSkills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="inline-flex items-center px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-medium"
            >
              {s}
            </span>
          ))}
          {subSkills.length > 4 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
              +{subSkills.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
        <Link
          href={`/jobs/${job._id}`}
          className="text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-primary"
        >
          View Job
        </Link>
        {showSave && (
          <SaveJobButton jobId={job._id} initialSaved={isSaved} />
        )}
      </div>
    </div>
  );
}
