import Link from "next/link";
import { type Locale, locales } from "@/lib/i18n";
import { getFooterSettings, type FooterSettings, type FooterLink } from "@/strapi/footer";
import { ThemeLogo } from "./theme-logo";
import { FooterAccordion } from "./footer-accordion";
import { Facebook, Instagram, Linkedin, Youtube, Music2, Github, Globe } from "lucide-react";
import { getTranslations } from "next-intl/server";

type SiteFooterProps = {
  locale: Locale;
};

const localePathPattern = new RegExp(`^/(${locales.join("|")})(/|$)`);
const isExternalUrl = (url: string) =>
  url.startsWith("http://") ||
  url.startsWith("https://") ||
  url.startsWith("mailto:") ||
  url.startsWith("tel:") ||
  url.startsWith("//");

function toLocaleAwareUrl(url: string, locale: Locale) {
  if (!url || isExternalUrl(url) || url.startsWith("#")) return url;
  if (!url.startsWith("/")) return `/${locale}/${url}`;
  if (localePathPattern.test(url)) return url;
  return url === "/" ? `/${locale}` : `/${locale}${url}`;
}

const XIcon = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const SocialIcon = ({ platform }: { platform: string }) => {
  const normalized = platform?.toLowerCase().trim();
  switch (normalized) {
    case "facebook":
      return <Facebook size={18} />;
    case "twitter":
    case "x":
      return <XIcon size={18} />;
    case "instagram":
      return <Instagram size={18} />;
    case "linkedin":
      return <Linkedin size={18} />;
    case "youtube":
      return <Youtube size={18} />;
    case "tiktok":
      return <Music2 size={18} />;
    case "github":
      return <Github size={18} />;
    default:
      return <Globe size={18} />;
  }
};

export async function SiteFooter({ locale }: SiteFooterProps) {
  const footerData: FooterSettings | null = await getFooterSettings(locale);
  const t = await getTranslations("footer");

  if (!footerData) {
    return null;
  }

  const { lightLogoUrl, darkLogoUrl, description, columns, socialLinks, bottomLinks } = footerData;

  const currentYear = new Date().getFullYear();
  const hardcodedCopyright = t("copyright", { year: currentYear });

  return (
    <footer className="w-full relative overflow-hidden bg-card/60 border-t border-border/80 pt-12 pb-[calc(2.5rem+env(safe-area-inset-bottom))] sm:py-16 px-4 sm:px-6">
      {/* Top accent glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 lg:gap-16 justify-between">

        {/* Branding & Description */}
        <div className="flex flex-col gap-5 max-w-sm">
          <ThemeLogo
            lightLogoUrl={lightLogoUrl}
            darkLogoUrl={darkLogoUrl}
            alt="Footer Logo"
            className="h-10 w-auto object-contain transition-transform duration-300 hover:scale-105"
            width={640}
            height={410}
            sizes="120px"
            quality={85}
          />
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
          {socialLinks && socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mt-1">
              {socialLinks.map((social, index) => (
                <a
                  key={`${social.platform}-${index}`}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-accent/70 text-muted-foreground hover:bg-primary hover:text-primary-foreground transform hover:-translate-y-0.5 shadow-xs transition-all duration-200"
                  aria-label={social.platform}
                >
                  <SocialIcon platform={social.platform} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Link Columns with Accordion on Mobile */}
        {columns && columns.length > 0 && (
          <div className="flex-1 md:max-w-3xl">
            <FooterAccordion columns={columns} locale={locale} />
          </div>
        )}
      </div>

      {/* Bottom Bar: Copyright & Policy Links */}
      <div className="max-w-7xl mx-auto mt-10 sm:mt-12 pt-6 border-t border-border/60 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <p className="font-medium text-center md:text-start">{hardcodedCopyright}</p>

        {bottomLinks && bottomLinks.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-6">
            {bottomLinks.map((link: FooterLink, index: number) => (
              <li key={index}>
                <Link
                  href={toLocaleAwareUrl(link.url, locale)}
                  target={link.openInNewTab ? "_blank" : "_self"}
                  rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                  className="hover:text-primary transition-colors duration-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
