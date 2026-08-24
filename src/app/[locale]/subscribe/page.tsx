import { redirect } from "next/navigation";
import { locales } from "@/lib/i18n";

type SubscribePageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function SubscribePage({ params }: SubscribePageProps) {
  const { locale } = await params;
  redirect(`/${locale || 'ar'}`);
}
