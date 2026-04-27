import Link from "next/link";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-[60vh] flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl border border-gray-100 w-full max-w-md p-8 shadow-sm">
          <Link
            href="/"
            className="block text-center text-3xl font-bold text-primary mb-2"
          >
            peersview
          </Link>
          <h1 className="text-center text-2xl font-bold text-primary mb-1">
            Forgot Password
          </h1>
          <p className="text-center text-sm text-gray-600 mb-6">
            We&rsquo;ll email you a link to reset it.
          </p>
          <ForgotPasswordForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
