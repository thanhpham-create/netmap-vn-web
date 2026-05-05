'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { COOKIE_NAME, LOCALES, type Locale } from './config';

export async function setLocale(locale: Locale) {
  if (!LOCALES.includes(locale)) return;
  const c = await cookies();
  c.set(COOKIE_NAME, locale, {
    path: '/',
    maxAge: 365 * 24 * 3600,
    sameSite: 'lax',
  });
  revalidatePath('/');
}
