import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { CompanyForm } from "@/components/company/CompanyForm";
import { auth } from "@/lib/auth";
import { getCompaniesByUser } from "@/services/company.service";
import { getDistinctProvinceOptions } from "@/services/job.service";
import { cloudinaryUrl } from "@/lib/cloudinary";

export default async function AddCompanyPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/company/add");
  }
  if (session.user.role !== "employer") {
    redirect("/");
  }

  const [existing, provinceOptions] = await Promise.all([
    getCompaniesByUser(session.user.id),
    getDistinctProvinceOptions(),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 py-10 lg:py-14">
        <div className="container-page max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6">
            Add Company
          </h1>
          <p className="text-gray-600 mb-8">
            Tell us about your organization. You can post jobs under it once
            it&rsquo;s saved.
          </p>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10">
            <CompanyForm provinceOptions={provinceOptions} />
          </div>

          {existing.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-bold text-primary mb-4">
                Your companies
              </h2>
              <ul className="space-y-3">
                {existing.map((c) => {
                  const logoSrc = cloudinaryUrl(c.logo, {
                    width: 96,
                    height: 96,
                    crop: "fill",
                  });
                  return (
                    <li
                      key={c._id}
                      className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3"
                    >
                      {logoSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoSrc}
                          alt={c.name}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-50 border border-gray-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                          {c.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {c.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {[c.industry, c.city, c.province]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <Link
                        href={`/company/${c._id}/edit`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/5 flex-shrink-0"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
