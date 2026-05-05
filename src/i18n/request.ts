// next-intl getRequestConfig — runs on every server request.
// Reads locale from cookie, falls back to Accept-Language header, then default.

import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { COOKIE_NAME, DEFAULT_LOCALE, LOCALES, type Locale } from './config';

export default getRequestConfig(async () => {
  const c = await cookies();
  const fromCookie = c.get(COOKIE_NAME)?.value as Locale | undefined;

  let locale: Locale = DEFAULT_LOCALE;
  if (fromCookie && LOCALES.includes(fromCookie)) {
    locale = fromCookie;
  } else {
    // Try Accept-Language header
    const h = await headers();
    const accept = h.get('accept-language') || '';
    if (/^en/i.test(accept)) locale = 'en';
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;
  return { locale, messages };
});
