import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Безбрехни — AI проверяет контент за вас",
  description:
    "Расширение и сервис, которые спокойно объясняют, насколько можно доверять тому, что вы читаете в интернете.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_LANDING_URL || "https://xn--80aaxzavh.xn--p1ai",
  ),
  openGraph: {
    title: "Безбрехни",
    description: "AI проверяет контент за вас",
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
