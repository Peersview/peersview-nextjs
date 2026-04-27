import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { PostJobForm } from "@/components/jobs/PostJobForm";
import { auth } from "@/lib/auth";
import { getCompaniesByUser } from "@/services/company.service";

export default async function PostJobPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/jobs/post");
  }
  if (session.user.role !== "employer") {
    redirect("/");
  }

  const myCompanies = await getCompaniesByUser(session.user.id);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 py-10 lg:py-14">
        <div className="container-page max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">
            Post a Job Listing
          </h1>

          {myCompanies.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <h2 className="text-xl font-bold text-primary mb-2">
                Add your company first
              </h2>
              <p className="text-gray-600 mb-6">
                You need to add your company before you can post a job. You can
                also select any other company from the dropdown when posting.
              </p>
              <Link href="/company/add" className="btn-primary inline-block">
                Add Company
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10">
              <PostJobForm myCompanies={myCompanies} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
