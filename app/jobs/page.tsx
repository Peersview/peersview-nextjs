import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobSearchBar } from "@/components/jobs/JobSearchBar";
import { JobsList } from "@/components/jobs/JobsList";
import { auth } from "@/lib/auth";
import { getJobsPaginated } from "@/services/job.service";
import { getSavedJobIds } from "@/services/savedJob.service";
import type { JobFilters as JobFiltersType, JobType } from "@/schemas/job.schema";

interface JobsPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    province?: string;
    city?: string;
    industry?: string;
    company?: string;
    workAuth?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: JobsPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const hasFilters = Object.values(sp).some(Boolean);

  const titleParts: string[] = [];
  if (sp.q) titleParts.push(`"${sp.q}"`);
  if (sp.type) titleParts.push(sp.type.replace("-", " "));
  if (sp.city) titleParts.push(sp.city);
  else if (sp.province) titleParts.push(sp.province);

  const title = titleParts.length
    ? `${titleParts.join(" · ")} Jobs`
    : "Browse Jobs";

  const description = hasFilters
    ? `Find ${titleParts.join(", ")} job openings on Peersview — connecting graduates and medical professionals with top employers.`
    : "Explore full-time, part-time, internship, co-op, and graduate job opportunities on Peersview — the talent discovery network for graduates and medical professionals.";

  const canonicalUrl = "/jobs";

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

const JOB_TYPES = new Set<JobType>([
  "full-time",
  "part-time",
  "internship",
  "graduate",
  "co-op",
]);

const PAGE_SIZE = 12;

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const sp = await searchParams;
  const session = await auth();

  const filters: JobFiltersType = {
    q: sp.q || undefined,
    type:
      sp.type && JOB_TYPES.has(sp.type as JobType)
        ? (sp.type as JobType)
        : undefined,
    province: sp.province || undefined,
    city: sp.city || undefined,
    industry: sp.industry || undefined,
    company: sp.company || undefined,
    workAuth: sp.workAuth === "1" || undefined,
  };

  const [paginated, savedIds] = await Promise.all([
    getJobsPaginated(filters, { page: 1, limit: PAGE_SIZE }),
    session?.user?.id
      ? getSavedJobIds(session.user.id)
      : Promise.resolve(new Set<string>()),
  ]);

  const isEmployer = session?.user?.role === "employer";

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 py-10 lg:py-14">
        <div className="container-page">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              Jobs you&rsquo;re looking for
            </h1>
            {isEmployer && (
              <Link href="/jobs/post" className="btn-primary text-sm px-6 py-2.5">
                Post a Job
              </Link>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <JobSearchBar />
            </div>
            <JobFilters />
          </div>

          <div className="mt-10">
            <JobsList
              initialJobs={paginated.jobs}
              initialSavedIds={Array.from(savedIds)}
              initialHasMore={paginated.hasMore}
              filters={filters}
              pageSize={PAGE_SIZE}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
