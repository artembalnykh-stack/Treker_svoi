import { AppHeader } from "@/components/layout/app-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getBoardContext } from "@/lib/session";

export default async function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Создаёт доску при первом визите и держит её в скоупе cookie-сессии.
  await getBoardContext();

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main id="main-content" className="flex-1 pb-4 pt-6 sm:pt-8">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
