import { redirect } from 'next/navigation';

export default function LocaleNotFound() {
  redirect('/');
}
