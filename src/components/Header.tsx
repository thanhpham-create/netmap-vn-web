'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth';
import LocaleSwitcher from './LocaleSwitcher';

export default function Header() {
  const t = useTranslations('nav');
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.role === 'operator';

  const NAV_ITEMS = [
    { href: '/',            label: t('map') },
    { href: '/speedtest',   label: t('speedtest') },
    { href: '/outages',     label: t('outages') },
    { href: '/compare',     label: t('compare') },
    { href: '/leaderboard', label: t('leaderboard') },
  ];

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-1.5 text-lg font-bold">
          <span className="text-vnred-500">NetMap</span>
          <span className="text-gray-700">VN</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-gray-700 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hover:text-vnred-500 ${pathname === item.href ? 'text-vnred-500' : ''}`}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-700 hover:bg-purple-200">
              {t('admin')}
            </Link>
          )}
          <LocaleSwitcher />
          {user ? (
            <Link href="/me" className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50">
              {user.displayName || user.phone}
            </Link>
          ) : (
            <Link href="/login" className="rounded-md bg-vnred-500 px-3 py-1.5 text-white hover:bg-vnred-600">
              {t('login')}
            </Link>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? t('closeMenu') : t('openMenu')}
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 md:hidden"
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6L18 18M6 18L18 6" strokeLinecap="round"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/></svg>
          )}
        </button>
      </div>

      {open && (
        <nav className="border-t bg-white md:hidden" role="navigation">
          <div className="flex flex-col py-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 text-base font-medium hover:bg-gray-50 ${
                  pathname === item.href ? 'bg-vnred-50 text-vnred-700' : 'text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className="border-t px-4 py-3 text-base font-medium text-purple-700 hover:bg-purple-50"
              >
                {t('admin')}
              </Link>
            )}
            <div className="flex items-center justify-between gap-2 border-t px-4 py-3">
              <LocaleSwitcher />
              {user ? (
                <Link
                  href="/me"
                  className="flex flex-1 items-center justify-between rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50"
                >
                  <span className="font-medium">{user.displayName || user.phone}</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex-1 rounded-md bg-vnred-500 py-2.5 text-center font-medium text-white hover:bg-vnred-600"
                >
                  {t('login')}
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
