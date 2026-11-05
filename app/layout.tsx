import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Свои — забота, которая не теряется",
    template: "%s · Свои",
  },
  description:
    "Демо-трекер семейных задач: спокойный канбан, участники, недельная сводка и доступный простой вид. Без регистрации.",
  applicationName: "Свои",
  keywords: [
    "демо-трекер",
    "канбан",
    "семейные задачи",
    "доступный интерфейс",
    "портфолио",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: "Свои — забота, которая не теряется",
    description:
      "Демо-трекер семейных задач. Попробуйте канбан, участников и простой режим без регистрации.",
    locale: "ru_RU",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FDFBF7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={manrope.variable}>
      <body>
        <a className="skip-link" href="#main-content">
          Перейти к содержимому
        </a>
        {children}
      </body>
    </html>
  );
}
