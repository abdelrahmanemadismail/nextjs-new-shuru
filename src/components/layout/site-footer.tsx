import Link from "next/link";
import { type Locale } from "@/lib/i18n";
import { getFooterSettings, type FooterSettings, type FooterLink } from "@/strapi/footer";
import { ThemeLogo } from "./theme-logo";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Music2, Github } from "lucide-react";
import { getTranslations } from "next-intl/server";

type SiteFooterProps = {
  locale: Locale;
};

const SocialIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case "Facebook":
      return <Facebook size={20} />;
    case "Twitter":
      return <Twitter size={20} />;
    case "Instagram":
      return <Instagram size={20} />;
    case "LinkedIn":
      return <Linkedin size={20} />;
    case "YouTube":
      return <Youtube size={20} />;
    case "TikTok":
      return <Music2 size={20} />;
    case "GitHub":
      return <Github size={20} />;
    default:
      return null;
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
    <footer className="w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800/50 py-12 sm:py-16 px-4 sm:px-6">
      {/* Subtle top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 justify-between">

        {/* Branding & Description */}
        <div className="flex flex-col gap-6 max-w-sm">
          <ThemeLogo
            lightLogoUrl={lightLogoUrl}
            darkLogoUrl={darkLogoUrl}
            alt="Footer Logo"
            className="h-10 w-auto object-contain transition-transform duration-300 hover:scale-105"
          />
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {description}
            </p>
          )}
          {socialLinks && socialLinks.length > 0 && (
            <div className="flex gap-4 mt-2" dir="ltr">
              {socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transform hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                  aria-label={social.platform}
                >
                  <SocialIcon platform={social.platform} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Links Columns */}
        <div className="flex flex-wrap gap-8 sm:gap-12 md:gap-24">
          {columns.map((col, index) => (
            <div key={index} className="flex flex-col gap-6">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-slate-900 dark:text-slate-100 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-slate-100 dark:to-slate-400">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-4">
                {col.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.url}
                      target={link.openInNewTab ? "_blank" : "_self"}
                      rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                      className="group flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors duration-300"
                    >
                      <span className="relative transform transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                        {link.label}
                        <span className="absolute -bottom-1 start-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-500" dir="ltr">
        <p className="font-medium text-slate-400">{hardcodedCopyright}</p>

        {bottomLinks && bottomLinks.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-6">
            {bottomLinks.map((link: FooterLink, index: number) => (
              <li key={index}>
                <Link
                  href={link.url}
                  target={link.openInNewTab ? "_blank" : "_self"}
                  rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                  className="hover:text-primary dark:hover:text-primary transition-colors duration-300"
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
