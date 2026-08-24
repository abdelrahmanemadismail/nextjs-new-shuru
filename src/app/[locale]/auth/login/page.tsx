import { redirect } from "next/navigation";
import { type Locale } from "@/lib/i18n";

type LoginPageProps = Readonly<{
  params: Promise<{ locale: Locale }>;
}>;

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  redirect(`/${locale || 'ar'}`);
}
