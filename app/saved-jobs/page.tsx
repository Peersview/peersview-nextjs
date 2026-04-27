import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { JobCard } from "@/components/jobs/JobCard";
import { auth } from "@/lib/auth";
import { getSavedJobs } from "@/services/savedJob.service";

export default async function SavedJobsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/saved-jobs");
  }

  const jobs = await getSavedJobs(session.user.id);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 py-10 lg:py-14">
        <div className="container-page">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              Saved Jobs
            </h1>
            <Link href="/jobs" className="btn-secondary text-sm px-6 py-2.5">
              Browse All Jobs
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-gray-500">
                You haven&rsquo;t saved any jobs yet. Browse jobs and click the
                bookmark to save them for later.
              </p>
              <Link
                href="/jobs"
                className="btn-primary mt-6 inline-block text-sm"
              >
                Find Jobs
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} isSaved />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
