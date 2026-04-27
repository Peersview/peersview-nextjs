import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import Image from "next/image";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;
  const isEmployer = user?.role === "employer";
  const isJobSeeker = !!user && !isEmployer;

  return (
    <header className="bg-white border-b border-gray-100">
      <nav className="container-page flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 ">
          <Image
            // Replace [YOUR_HEX_COLOR] with your actual hex (e.g., 2d1b4e)
            // Note: Do NOT include the '#' symbol in the URL
            src="https://res.cloudinary.com/peersview-com/image/upload/e_colorize,co_rgb:2d1b4e/peersviewLogo"
            alt="Peersview Logo"
            width={96}
            height={36}
            className="object-contain"
          />
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          <li>
            <NavLink href="/jobs">Jobs</NavLink>
          </li>

          {isJobSeeker && (
            <li>
              <NavLink href="/saved-jobs">Saved Jobs</NavLink>
            </li>
          )}

          {isEmployer && (
            <>
              <li>
                <NavLink href="/company/add">Add Company</NavLink>
              </li>
              <li>
                <NavLink href="/employer/applications">Applications</NavLink>
              </li>
              <li>
                <NavLink href="/jobs/post">Post a Job</NavLink>
              </li>
            </>
          )}

          {user ? (
            <>
              <li>
                <NavLink href="/profile">Profile</NavLink>
              </li>
              <li>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button
                    type="submit"
                    className="btn-primary text-sm py-2 px-4"
                  >
                    Sign out
                  </button>
                </form>
              </li>
            </>
          ) : (
            <li>
              <Link href="/sign-in" className="btn-primary text-sm py-2 px-4">
                Sign In
              </Link>
            </li>
          )}
        </ul>

        <details className="md:hidden relative">
          <summary className="list-none cursor-pointer p-2">
            <span className="block w-6 h-0.5 bg-primary mb-1.5"></span>
            <span className="block w-6 h-0.5 bg-primary mb-1.5"></span>
            <span className="block w-6 h-0.5 bg-primary"></span>
          </summary>
          <ul className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-lg p-2 z-50 flex flex-col gap-1">
            <li>
              <MobileLink href="/jobs">Jobs</MobileLink>
            </li>
            {isJobSeeker && (
              <li>
                <MobileLink href="/saved-jobs">Saved Jobs</MobileLink>
              </li>
            )}
            {isEmployer && (
              <>
                <li>
                  <MobileLink href="/company/add">Add Company</MobileLink>
                </li>
                <li>
                  <MobileLink href="/employer/applications">
                    Applications
                  </MobileLink>
                </li>
                <li>
                  <MobileLink href="/jobs/post">Post a Job</MobileLink>
                </li>
              </>
            )}
            {user ? (
              <>
                <li>
                  <MobileLink href="/profile">Profile</MobileLink>
                </li>
                <li>
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                  >
                    <button
                      type="submit"
                      className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded"
                    >
                      Sign out
                    </button>
                  </form>
                </li>
              </>
            ) : (
              <>
                <li>
                  <MobileLink href="/sign-up">Sign Up</MobileLink>
                </li>
                <li>
                  <MobileLink href="/sign-in" highlight>
                    Sign In
                  </MobileLink>
                </li>
              </>
            )}
          </ul>
        </details>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-primary"
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  children,
  highlight = false,
}: {
  href: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block px-4 py-2 text-sm font-semibold rounded hover:bg-gray-50 ${
        highlight ? "text-primary" : "text-gray-700"
      }`}
    >
      {children}
    </Link>
  );
}
