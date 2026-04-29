"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Testimonial {
  quote: string;
  name: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Gabriel is highly efficient, extremely professional, and always happy to help. I have worked with Peersview in recruiting for my clinic for about 2 years now. He has been excellent to work with.",
    name: "Dr. Anand Patel",
    avatar:
      "https://res.cloudinary.com/peersview-com/image/upload/v1589081355/Raju_K_xrmtwv.jpg",
  },
  {
    quote:
      "Peersview Media Inc. has been incredible in their support, knowledge, kindness and availability in facilitating my move from working as a GP in the UK to relocating to Canada. The process is lengthy and can be frustrating at times, but Gabriel always was able to help and provide guidance. THANK YOU!",
    name: "Dr. A. Gupta",
    avatar:
      "https://res.cloudinary.com/peersview-com/image/upload/v1589081354/Lisa_M_xxl4om.jpg",
  },
  {
    quote:
      "Excellent services! Gabriel is an extremely helpful and wonderful man, and I have no doubts to recommend him for the new comer doctors and the existing ones in Canada. I have been guided by Gabriel throughout my application step by step.",
    name: "Dr. George O.",
    avatar:
      "https://res.cloudinary.com/peersview-com/image/upload/v1695113362/GEORGE_O_rwqqm8.jpg",
  },
  {
    quote:
      "Gabriel is a very genuine and honest man, knows how to communicate and very friendly.",
    name: "Naveed Khan",
    avatar:
      "https://res.cloudinary.com/peersview-com/image/upload/v1589081355/Sam_Cook_cfuwdm.jpg",
  },
  {
    quote:
      "Peersview Media Inc were absolutely amazing in the services provided to help me through the process of relocating to Canada from the U.K. They listened to my specific requests and delivered one hundred percent.",
    name: "Dr. Sandra Isi",
    avatar:
      "https://res.cloudinary.com/peersview-com/image/upload/v1589081302/Dami_oyepitan_umj6xn.jpg",
  },
];

export function TestimonialsSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % testimonials.length),
      6000,
    );
    return () => clearInterval(id);
  }, []);

  const current = testimonials[index];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container-page">
        <h2 className="text-3xl md:text-4xl font-bold text-primary text-center">
          WHY JOIN US?
        </h2>
        <p className="mt-4 max-w-3xl mx-auto text-center text-gray-600">
          Peersview provides the opportunity for you to join one of the thriving
          family practices and hospitals we represent across Canada, Australia
          and The Middle East.
        </p>

        <div className="mt-14 max-w-3xl mx-auto bg-white border border-gray-100 rounded-2xl p-8 md:p-10 shadow-sm relative">
          <div className="flex justify-center -mt-16 mb-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-md">
              <Image
                src={current.avatar}
                alt={current.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          </div>

          <p className="text-center text-gray-700 italic leading-relaxed">
            &ldquo;{current.quote}&rdquo;
          </p>
          <p className="mt-6 text-center font-bold text-primary">
            {current.name}
          </p>

          <div className="mt-8 flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition ${
                  i === index ? "bg-primary" : "bg-gray-300"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-14 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-primary">
            So What Are You Waiting For?
          </h3>
          <Link href="/sign-up" className="btn-primary mt-6">
            SIGN UP
          </Link>
        </div>
      </div>
    </section>
  );
}
