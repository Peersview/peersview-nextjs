import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/SignInForm";
import { auth } from "@/lib/auth";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="flex-1 min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl border border-gray-100 w-full max-w-md p-8 shadow-sm">
        <Link
          href="/"
          className="block text-center text-3xl font-bold text-primary mb-2"
        >
          peersview
        </Link>
        <h1 className="text-center text-2xl font-bold text-primary mb-1">
          Sign In
        </h1>
        <p className="text-center text-sm text-gray-600 mb-6">
          Login with your peersview account
        </p>

        <Suspense>
          <SignInForm />
        </Suspense>
      </div>
    </main>
  );
}
