"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  "https://res.cloudinary.com/peersview-com/image/upload/v1596006017/slider-1_dajbz3.png",
  "https://res.cloudinary.com/peersview-com/image/upload/v1596006017/slider-2_rg6oxr.png",
  "https://res.cloudinary.com/peersview-com/image/upload/v1596006017/slider-3_z8pf9p.png",
];

export function CareerSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      4500,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section id="leisure" className="py-16 lg:py-20 bg-white">
      <div className="container-page">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1 relative w-full aspect-square max-w-md mx-auto">
            {slides.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt={`slide ${i + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={`object-contain transition-opacity duration-700 ${
                  i === index ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition ${
                    i === index ? "bg-primary" : "bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h3 className="text-accent font-semibold uppercase tracking-wide">
              Career Development
            </h3>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-primary">
              Find Postgraduate Opportunities &amp; Scholarships
            </h2>

            <div className="mt-8 space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Image
                    src="https://res.cloudinary.com/peersview-com/image/upload/v1584688361/file-list-3-line_u3it0j.svg"
                    alt="Course"
                    width={24}
                    height={24}
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Course Search</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Find all the extra training or qualifications you need to
                    excel in your chosen career.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Image
                    src="https://res.cloudinary.com/peersview-com/image/upload/v1584688364/search-eye-line_ealt08.svg"
                    alt="Compare"
                    width={24}
                    height={24}
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Find and Compare</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Scholarships, grants, fellowships and other student funding
                    Worldwide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
