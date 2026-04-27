import type { Metadata } from "next";
import { Maven_Pro } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

const mavenPro = Maven_Pro({
  variable: "--font-maven-pro",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL ?? "https://peersview.com"
  ),
  title: {
    default: "Peersview Media Inc — The Talent Discovery Network",
    template: "%s | Peersview",
  },
  description:
    "Connecting graduates and medical professionals with job opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${mavenPro.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-foreground">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
