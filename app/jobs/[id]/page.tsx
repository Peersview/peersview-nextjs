import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, MapPin, Calendar } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { ApplyModal } from "@/components/jobs/ApplyModal";
import { auth } from "@/lib/auth";
import { getJobById } from "@/services/job.service";
import { cloudinaryUrl, formatLocation, formatDate } from "@/lib/cloudinary";

const typeLabels = {
  "full-time": "Full-Time",
  "part-time": "Part-Time",
  internship: "Internship",
  graduate: "Graduate Role",
  "co-op": "Co-op",
} as const;

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: JobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    return { title: "Job Not Found" };
  }

  const locationParts = [job.city, job.province].filter(Boolean);
  const locationLabel = locationParts.join(", ");
  const typeLabel = typeLabels[job.type] ?? job.type;

  const title = `${job.title} at ${job.company}`;
  const descriptionParts = [
    `${typeLabel} position`,
    locationLabel ? `in ${locationLabel}` : null,
    job.industry ? `· ${job.industry}` : null,
  ].filter(Boolean);
  const description = `${descriptionParts.join(" ")}. ${job.jobFunction?.slice(0, 120).trim() ?? ""}${job.jobFunction?.length > 120 ? "…" : ""}`;

  const canonicalUrl = `/jobs/${id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Peersview`,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "Peersview",
    },
    twitter: {
      card: "summary",
      title: `${title} | Peersview`,
      description,
    },
  };
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const [job, session] = await Promise.all([getJobById(id), auth()]);

  if (!job) notFound();

  const skills = job.multipleSkills
    ? job.multipleSkills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const logoSrc = cloudinaryUrl(job.companyLogo, { width: 128, height: 128, crop: "fill" });
  const locationLabel = [job.city, job.province]
    .map((s) => formatLocation(s))
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 py-10 lg:py-14">
        <div className="container-page max-w-4xl">
          <Link
            href="/jobs"
            className="inline-flex items-center text-sm font-semibold text-primary hover:underline mb-6"
          >
            ← Back to Jobs
          </Link>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex items-start gap-4 min-w-0 flex-1">
                {logoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoSrc}
                    alt={job.company}
                    className="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-gray-100 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl flex-shrink-0">
                    {initials(job.company || "P")}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {job.company}
                  </p>
                  <h1 className="mt-1 text-2xl md:text-3xl font-bold text-primary leading-tight">
                    {job.title}
                  </h1>

                  {/* Meta pills */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-secondary flex-shrink-0" />
                      {typeLabels[job.type]}
                    </span>
                    {locationLabel && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
                        {locationLabel}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-secondary flex-shrink-0" />
                      Apply by {formatDate(job.deadline)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:text-right space-y-3 flex-shrink-0">
                <p className="text-2xl font-bold text-gray-900">
                  ${job.price}
                </p>
                <div>
                  <ApplyModal
                    jobId={job._id}
                    jobTitle={job.title}
                    isAuthenticated={!!session?.user}
                  />
                </div>
              </div>
            </div>

            <hr className="my-8 border-gray-100" />

            {job.companyBio && (
              <section>
                <h2 className="text-lg font-bold text-primary mb-2">About Us</h2>
                <p className="text-gray-700 whitespace-pre-line">{job.companyBio}</p>
              </section>
            )}

            <section className={job.companyBio ? "mt-8" : ""}>
              <h2 className="text-lg font-bold text-primary mb-2">Job Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{job.jobFunction}</p>
            </section>

            {job.coreSkills && (
              <section className="mt-8">
                <h2 className="text-lg font-bold text-primary mb-2">Core Skill</h2>
                <span className="inline-block bg-accent text-white text-sm px-4 py-1.5 rounded-full">
                  {job.coreSkills}
                </span>
              </section>
            )}

            {skills.length > 0 && (
              <section className="mt-8">
                <h2 className="text-lg font-bold text-primary mb-2">Other Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-primary/5 text-primary text-sm px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-8">
              <h2 className="text-lg font-bold text-primary mb-2">Contact</h2>
              <p className="text-gray-700">{job.contact}</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
