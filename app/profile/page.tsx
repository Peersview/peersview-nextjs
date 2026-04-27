import { redirect } from "next/navigation";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { auth } from "@/lib/auth";
import { getUserById } from "@/services/auth.service";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/profile");
  }

  const user = await getUserById(session.user.id);
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 py-10 lg:py-14">
        <div className="container-page max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">
            Your Profile
          </h1>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10">
            <ProfileForm user={user} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
