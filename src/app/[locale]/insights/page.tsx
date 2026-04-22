import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) notFound();
  setRequestLocale(locale);

  return (
    <main className="container py-24 mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8">Insights</h1>
      <p>Content for Insights goes here.</p>
    </main>
  );
}
