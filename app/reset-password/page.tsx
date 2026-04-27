import Link from "next/link";
import { Suspense } from "react";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
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
          <h1 className="text-center text-2xl font-bold text-primary mb-6">
            Reset Password
          </h1>
          <Suspense>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
