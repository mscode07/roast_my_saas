import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "Roast My SaaS — Brutally useful landing page reviews",
  description:
    "Drop your SaaS URL. Get a funny, useful landing-page roast in seconds.",
  openGraph: {
    title: "Roast My SaaS",
    description: "Your landing page called. It wants a makeover.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roast My SaaS",
    description: "Your landing page called. It wants a makeover.",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {children}
        <footer className="site-footer">
          © {new Date().getFullYear()} Roast My SaaS · Roast the page, not the
          person.
        </footer>
      </body>
    </html>
  );
}
