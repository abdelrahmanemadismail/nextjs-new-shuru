import { redirect } from 'next/navigation';
import { ClientRedirect } from '@/components/shared/client-redirect';

export default function LocaleNotFound() {
  redirect('/');
  return <ClientRedirect to="/" />;
}

