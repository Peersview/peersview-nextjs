import { redirect } from "next/navigation";
import { Briefcase, FileText, Mail, Calendar } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { auth } from "@/lib/auth";
import { getApplicationsForEmployer } from "@/services/application.service";
import { formatDate } from "@/lib/cloudinary";

const statusStyles = {
  pending: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
  reviewed: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  rejected: "bg-red-50 text-red-600 ring-1 ring-red-200",
} as const;

export const metadata = { title: "Job Applications | Peersview" };

export default async function EmployerApplicationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if (session.user.role !== "employer") redirect("/jobs");

  const applications = await getApplicationsForEmployer(session.user.id);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 py-10 lg:py-14 min-h-screen">
        <div className="container-page max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">Job Applications</h1>
            <p className="text-gray-500 mt-1">
              All applications received for your posted jobs.
            </p>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <Briefcase className="mx-auto w-12 h-12 text-gray-200 mb-4" />
              <p className="text-gray-500 text-lg">No applications yet.</p>
              <p className="text-gray-400 text-sm mt-1">
                Applications for your posted jobs will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-primary/20 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
                        {app.jobTitle}
                      </p>
                      <p className="text-base font-bold text-primary">
                        {app.applicantName}
                      </p>
                      <p className="text-sm text-gray-500 inline-flex items-center gap-1 mt-0.5">
                        <Mail className="w-3.5 h-3.5" />
                        {app.applicantEmail}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusStyles[app.status]}`}
                      >
                        {app.status}
                      </span>
                      <span className="text-xs text-gray-400 inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(app.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary border border-primary/30 px-4 py-1.5 rounded-lg hover:bg-primary/5 transition"
                    >
                      <FileText className="w-4 h-4" />
                      View Resume
                    </a>
                    {app.coverLetterUrl && (
                      <a
                        href={app.coverLetterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 border border-gray-200 px-4 py-1.5 rounded-lg hover:bg-gray-50 transition"
                      >
                        <FileText className="w-4 h-4" />
                        Cover Letter
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
