import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="bg-white overflow-hidden">
      <div className="container-page py-16 md:py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text column */}
          <div>
            {/* <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight">
              The Talent Discovery Network
            </h1> */}
            <h1 className="mt-6 text-lg md:text-xl text-gray-700 font-bold text-primary leading-tight">
              Connecting medical professionals with job opportunities in Canada,
              Australia and the Middle East.
            </h1>

            <dl className="mt-10 grid grid-cols-2 gap-6 text-gray-900">
              {/* <div>
                <dt className="text-3xl md:text-4xl font-bold">20,000+</dt>
                <dd className="text-base text-gray-600">Members</dd>
              </div> */}
              <div>
                <dt className="text-3xl md:text-4xl font-bold">5,000+</dt>
                <dd className="text-base text-gray-600">
                  Jobs and Internships
                </dd>
              </div>
            </dl>

            <Link
              href="/sign-up"
              className="btn-primary mt-10 inline-flex px-8 py-3 text-sm tracking-wide"
            >
              SIGN UP FOR FREE
            </Link>
          </div>

          {/* Illustration — hidden on mobile so it never overlaps text */}
          <div className="hidden lg:flex justify-center lg:justify-end">
            <Image
              src="https://res.cloudinary.com/peersview-com/image/upload/v1584633639/undraw_social_networking_nqk4_1_emin25.png"
              alt="The Talent Discovery Network"
              width={580}
              height={480}
              priority
              className="w-full max-w-lg h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
