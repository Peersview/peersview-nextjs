import Image from "next/image";

const partners = [
  "https://res.cloudinary.com/peersview-com/image/upload/v1583221209/platform_calgary_qyfhe5.png",
  "https://res.cloudinary.com/peersview-com/image/upload/v1589905055/SAIT_PLP_Logo_tnud14.jpg",
  "https://res.cloudinary.com/peersview-com/image/upload/v1694695711/Bowglen_Medical_Center_logo.jpeg_yavgd7.jpg",
  "https://res.cloudinary.com/peersview-com/image/upload/v1694755178/HearthHealth_LOGO_umhgpn.png",
  "https://res.cloudinary.com/peersview-com/image/upload/v1694755199/WECareLOGO_irznv1.png",
  "https://res.cloudinary.com/peersview-com/image/upload/v1583221376/Afritech_XYz_tzp8j1.jpg",
  "https://res.cloudinary.com/peersview-com/image/upload/v1607467203/BOWEN-LOGO-Rectangle-Colour-300x131_gp34qu.png",
];

export function PartnerNetwork() {
  return (
    <section id="network" className="py-16 lg:py-20 bg-white">
      <div className="container-page">
        <h2 className="text-3xl md:text-4xl font-bold text-primary text-center">
          Our Partner Network
        </h2>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-8 items-center">
          {partners.map((src, i) => (
            <div
              key={src}
              className="relative w-full h-20 grayscale hover:grayscale-0 transition"
            >
              <Image
                src={src}
                alt={`Partner ${i + 1}`}
                fill
                sizes="(max-width: 1024px) 25vw, 14vw"
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
