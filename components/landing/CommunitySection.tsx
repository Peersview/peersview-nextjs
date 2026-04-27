import Image from "next/image";

const features = [
  {
    title: "Connect",
    icon: "https://res.cloudinary.com/peersview-com/image/upload/v1584688361/chat-smile-2-line_lj59ek.svg",
    description:
      "with a community of graduates within your field of study, and other fields, from various universities and colleges.",
  },
  {
    title: "Ask",
    icon: "https://res.cloudinary.com/peersview-com/image/upload/v1584688361/chat-voice-line_iad5ii.svg",
    description: "questions from professionals on topics relating to your career.",
  },
  {
    title: "Build",
    icon: "https://res.cloudinary.com/peersview-com/image/upload/v1584688361/command-line_slkrj5.svg",
    description:
      "relationships based on shared interest. Stay connected with employers and colleagues.",
  },
  {
    title: "Learn",
    icon: "https://res.cloudinary.com/peersview-com/image/upload/v1584688361/code-s-slash-fill_epw0nl.svg",
    description: "valuable and relevant skills required in your desired career path.",
  },
];

export function CommunitySection() {
  return (
    <section id="community" className="py-16 lg:py-20 bg-white">
      <div className="container-page">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1">
            <Image
              src="https://res.cloudinary.com/peersview-com/image/upload/v1584995778/Community_connect_odzmil.png"
              alt="Community"
              width={600}
              height={500}
              className="w-full h-auto"
            />
          </div>

          <div className="order-1 lg:order-2">
            <h3 className="text-accent font-semibold uppercase tracking-wide">
              Community
            </h3>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-primary">
              Build Meaningful Connections
            </h2>

            <div className="mt-8 grid sm:grid-cols-2 gap-6">
              {features.map((f) => (
                <div key={f.title}>
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                    <Image
                      src={f.icon}
                      alt={f.title}
                      width={24}
                      height={24}
                    />
                  </div>
                  <p className="font-semibold text-primary">{f.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
