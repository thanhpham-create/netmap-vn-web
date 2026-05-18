'use client';

// Cmd-K (Mac) / Ctrl-K (Windows/Linux) command palette.
// Quick navigation tới mọi page + filter by typed query.
// Lightweight: tự viết, không thêm dependency (cmdk, kbar).

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PROVINCES } from '@/lib/provinces';
import { CARRIERS } from '@/lib/carriers';

type Item = {
  group: string;
  label: string;
  hint?: string;
  path: string;
  keywords: string;   // pre-built lowercase no-diacritics for matching
};

// Strip Vietnamese diacritics for accent-insensitive search.
function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase();
}

function buildItems(): Item[] {
  const core: Array<Omit<Item, 'keywords'>> = [
    { group: 'Trang chính', label: 'Trang chủ',         path: '/',              hint: 'Map + outage banner' },
    { group: 'Trang chính', label: 'Đo tốc độ',         path: '/speedtest',     hint: 'Speed test' },
    { group: 'Trang chính', label: 'Sự cố mạng',        path: '/outages',       hint: 'Báo cáo + danh sách' },
    { group: 'Trang chính', label: 'So sánh nhà mạng',  path: '/compare',       hint: 'Filter province + days + network' },
    { group: 'Trang chính', label: 'Bảng xếp hạng',     path: '/leaderboard',   hint: 'Top contributors' },
    { group: 'Trang chính', label: 'Huy hiệu',          path: '/badges' },
    { group: 'Trang chính', label: 'Trạng thái hệ thống', path: '/status',      hint: 'Backend uptime' },
    { group: 'Trang chính', label: 'API Documentation', path: '/api-docs' },
    { group: 'Tài khoản',   label: 'Đăng nhập',         path: '/login' },
    { group: 'Tài khoản',   label: 'Hồ sơ của tôi',     path: '/me' },
    { group: 'Khám phá',    label: 'Tất cả tỉnh',       path: '/coverage' },
    { group: 'Khám phá',    label: 'Tất cả nhà mạng',   path: '/carriers' },
    { group: 'Khám phá',    label: 'Giới thiệu',        path: '/about' },
  ];

  const provinceItems: Array<Omit<Item, 'keywords'>> = PROVINCES.map((p) => ({
    group: 'Tỉnh / Thành phố',
    label: p.display,
    hint: 'Phủ sóng mạng tại tỉnh này',
    path: `/coverage/${p.slug}`,
  }));

  const carrierItems: Array<Omit<Item, 'keywords'>> = CARRIERS.map((c) => ({
    group: 'Nhà mạng',
    label: c.display,
    hint: c.tagline,
    path: `/carriers/${c.slug}`,
  }));

  return [...core, ...provinceItems, ...carrierItems].map((it) => ({
    ...it,
    keywords: normalize(`${it.label} ${it.hint || ''} ${it.path} ${it.group}`),
  }));
}

const ALL_ITEMS = buildItems();

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Cmd/Ctrl+K shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Auto-focus on open + reset
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Filter + group
  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    const matched = q
      ? ALL_ITEMS.filter((it) => it.keywords.includes(q))
      : ALL_ITEMS.slice(0, 12);   // show top-12 when empty
    return matched;
  }, [query]);

  // Group items by group name (preserving order)
  const grouped = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const it of filtered) {
      const arr = map.get(it.group) ?? [];
      arr.push(it);
      map.set(it.group, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  function go(path: string) {
    setOpen(false);
    router.push(path);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) go(item.path);
    }
  }

  if (!open) return null;

  let flatIdx = -1;   // running index for keyboard highlight
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <span aria-hidden className="text-gray-400">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={onKeyDown}
            placeholder="Tìm trang, tỉnh, nhà mạng…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
          <kbd className="rounded border px-1.5 py-0.5 text-[10px] text-gray-400">ESC</kbd>
        </div>

        <div className="flex-1 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-500">Không tìm thấy kết quả</p>
          ) : (
            grouped.map(([group, items]) => (
              <div key={group} className="mb-2">
                <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  {group}
                </p>
                {items.map((it) => {
                  flatIdx += 1;
                  const isActive = flatIdx === activeIndex;
                  return (
                    <button
                      key={`${it.path}-${it.label}`}
                      onClick={() => go(it.path)}
                      onMouseEnter={() => setActiveIndex(flatIdx)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                        isActive ? 'bg-vnred-50 text-vnred-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="font-medium">{it.label}</p>
                        {it.hint && <p className="text-[11px] text-gray-400">{it.hint}</p>}
                      </div>
                      <span className="text-[10px] text-gray-400">{it.path}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t bg-gray-50 px-3 py-1.5 text-[10px] text-gray-500">
          <span>
            <kbd className="rounded border bg-white px-1.5 py-0.5">↑↓</kbd> điều hướng ·{' '}
            <kbd className="rounded border bg-white px-1.5 py-0.5">↵</kbd> mở
          </span>
          <span>
            <kbd className="rounded border bg-white px-1.5 py-0.5">⌘K</kbd> để mở lại
          </span>
        </div>
      </div>
    </div>
  );
}
