import Link from "next/link";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { verifyEmailAction } from "@/app/actions/auth";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams;
  const result = token
    ? await verifyEmailAction(token)
    : { error: { _form: ["Missing verification token"] } };

  const success = !!result.data;
  const message = success
    ? "Your email is verified! You can now sign in."
    : (result.error?._form?.[0] ?? "Verification failed");

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 py-16">
        <div className="container-page max-w-lg">
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <h1
              className={`text-2xl font-bold mb-3 ${
                success ? "text-primary" : "text-red-600"
              }`}
            >
              {success ? "Email verified" : "Verification problem"}
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              href={success ? "/sign-in" : "/"}
              className="btn-primary inline-block"
            >
              {success ? "Sign in" : "Back home"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
