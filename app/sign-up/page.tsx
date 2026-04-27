import Link from "next/link";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { auth } from "@/lib/auth";

export default async function SignUpPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="flex-1 min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl border border-gray-100 w-full max-w-lg p-8 shadow-sm">
        <Link
          href="/"
          className="block text-center text-3xl font-bold text-primary mb-2"
        >
          peersview
        </Link>
        <h1 className="text-center text-2xl font-bold text-primary mb-6">
          Sign Up
        </h1>

        <SignUpForm />
      </div>
    </main>
  );
}
