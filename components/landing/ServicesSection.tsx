import Image from "next/image";
import Link from "next/link";

const services = [
  {
    title: "COMMUNITY",
    image:
      "https://res.cloudinary.com/peersview-com/image/upload/servicesCommunity",
    href: "#community",
  },
  {
    title: "TRENDING NOW",
    image:
      "https://res.cloudinary.com/peersview-com/image/upload/serviceTrendingNow",
    href: "#news",
  },
  {
    title: "LEISURE",
    image:
      "https://res.cloudinary.com/peersview-com/image/upload/serviceEvents",
    href: "#leisure",
  },
  {
    title: "DIGITAL CAMPUS",
    image:
      "https://res.cloudinary.com/peersview-com/image/upload/serviceCampus",
    href: "#network",
  },
];

export function ServicesSection() {
  return (
    <section className="bg-gray-50 py-16 hidden sm:block">
      <div className="container-page">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {services.map((s) => (
            <div key={s.title} className="text-center">
              <h4 className="text-primary font-bold tracking-wide mb-4">
                {s.title}
              </h4>
              <div className="relative w-full aspect-square mb-4">
                <Image
                  src={s.image}
                  alt={s.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-contain"
                />
              </div>
              <Link
                href={s.href}
                className="text-sm text-gray-700 underline hover:text-primary"
              >
                Learn More
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/sign-up" className="btn-primary">
            SIGN UP HERE
          </Link>
        </div>
      </div>
    </section>
  );
}
