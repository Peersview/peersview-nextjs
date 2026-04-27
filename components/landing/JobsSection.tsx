import Image from "next/image";
import Link from "next/link";

export function JobsSection() {
  return (
    <section id="news" className="py-16 lg:py-20 bg-gray-50">
      <div className="container-page">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-accent font-semibold uppercase tracking-wide">
              Jobs
            </h3>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-primary">
              More than just a Job Board! Search and filter through Part-time /
              Full-time Opportunities to find your dream Job.
            </h2>

            <div className="mt-8 space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Image
                    src="https://res.cloudinary.com/peersview-com/image/upload/v1584688419/wallet-line-1_f01p3q.svg"
                    alt="Jobs"
                    width={24}
                    height={24}
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    5,000+ Jobs Available
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Find relevant Locum, Full-time or Telehealth opportunities as
                    a Medical professional or recent graduate.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Image
                    src="https://res.cloudinary.com/peersview-com/image/upload/v1584688364/share-circle-line_s8zjlf.svg"
                    alt="Resume"
                    width={24}
                    height={24}
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    Get discovered with a Digital Resume
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Introduce yourself with a profile that projects your unique
                    personality, credentials, permits and work history for
                    potential employers to view.
                  </p>
                </div>
              </div>
            </div>

            <Link href="/jobs" className="btn-primary mt-10">
              Explore the Jobs &gt;&gt;
            </Link>
          </div>

          <div>
            <Image
              src="https://res.cloudinary.com/peersview-com/image/upload/v1588155479/peersview_image_tewutp.jpg"
              alt="Jobs"
              width={700}
              height={500}
              className="w-full h-auto rounded-xl shadow-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
