import { type Locale } from "@/lib/i18n";
import { getHeaderSettings } from "@/strapi/header";
import { HeaderNavigation } from "@/components/layout/header-navigation";
import { getMagazineIssuesCached } from "@/strapi/insights";
import { getMe } from "@/lib/actions/auth";

type SiteHeaderProps = {
  locale: Locale;
};

export async function SiteHeader({ locale }: SiteHeaderProps) {
  const [session, headerData, magazineIssues] = await Promise.all([
    getMe(),
    getHeaderSettings(locale),
    getMagazineIssuesCached(locale).catch((err) => {
      console.error("Error fetching magazine issues in SiteHeader:", err);
      return [];
    }),
  ]);

  if (!headerData) {
    return null;
  }

  const latestMagazine = magazineIssues?.[0] || null;

  return (
    <header className="sticky top-0 z-40 w-full ">
      <HeaderNavigation
        locale={locale}
        items={headerData.navigationItems}
        lightLogoUrl={headerData.lightLogoUrl}
        darkLogoUrl={headerData.darkLogoUrl}
        logoAlt={headerData.logoAlt}
        topBar={headerData.topBar}
        latestMagazine={latestMagazine}
        user={session?.user || null}
      />
    </header>
  );
}