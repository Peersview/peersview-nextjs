import { notFound, redirect } from "next/navigation";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { CompanyForm } from "@/components/company/CompanyForm";
import { auth } from "@/lib/auth";
import { getCompanyById } from "@/services/company.service";

interface EditCompanyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCompanyPage({
  params,
}: EditCompanyPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=/company/${id}/edit`);
  }
  if (session.user.role !== "employer") {
    redirect("/");
  }

  const company = await getCompanyById(id);

  if (!company) notFound();
  if (company.userId !== session.user.id) redirect("/company/add");

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 py-10 lg:py-14">
        <div className="container-page max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6">
            Edit Company
          </h1>
          <p className="text-gray-600 mb-8">
            Update the details for <strong>{company.name}</strong>.
          </p>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10">
            <CompanyForm company={company} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
