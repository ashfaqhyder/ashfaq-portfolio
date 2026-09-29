import type { Metadata } from "next";

import "./globals.css";

import AppearanceProvider from "@/components/providers/AppearanceProvider";
import { getServerSeoSettings } from "@/services/seo-server";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getServerSeoSettings();

  const metadata: Metadata = {
    title: seo.title,

    description: seo.description,

    authors: seo.author
      ? [
          {
            name: seo.author,
          },
        ]
      : undefined,

    keywords: seo.keywords,

    robots: {
      index: seo.robotsIndex,
      follow: seo.robotsFollow,
    },

    openGraph: {
      title: seo.ogTitle || seo.title,
      description:
        seo.ogDescription || seo.description,
      siteName: seo.siteName,
      type: "website",

      ...(seo.ogImage
        ? {
            images: [
              {
                url: seo.ogImage,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card:
        seo.twitterCard === "summary"
          ? "summary"
          : "summary_large_image",

      title: seo.ogTitle || seo.title,

      description:
        seo.ogDescription || seo.description,

      ...(seo.ogImage
        ? {
            images: [seo.ogImage],
          }
        : {}),
    },
  };

  const canonicalUrl =
    seo.canonicalUrl || seo.siteUrl;

  if (canonicalUrl) {
    metadata.alternates = {
      canonical: canonicalUrl,
    };
  }

  return metadata;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppearanceProvider>
          {children}
        </AppearanceProvider>
      </body>
    </html>
  );
}