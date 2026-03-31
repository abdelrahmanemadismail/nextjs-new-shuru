import { type Locale } from "@/lib/i18n";
import { getHeaderSettings } from "@/strapi/header";
import { HeaderNavigation } from "@/components/layout/header-navigation";

type SiteHeaderProps = {
  locale: Locale;
};

export async function SiteHeader({ locale }: SiteHeaderProps) {
  const headerData = await getHeaderSettings(locale);

  if (!headerData) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full ">
      <HeaderNavigation
        locale={locale}
        items={headerData.navigationItems}
        lightLogoUrl={headerData.lightLogoUrl}
        darkLogoUrl={headerData.darkLogoUrl}
        logoAlt={headerData.logoAlt}
        topBar={headerData.topBar}
      />
    </header>
  );
}