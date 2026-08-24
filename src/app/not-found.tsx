import { redirect } from 'next/navigation';
import { ClientRedirect } from '@/components/shared/client-redirect';

export default function NotFound() {
  redirect('/');
  return <ClientRedirect to="/" />;
}

