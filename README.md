# NetMap VN — Web

Frontend cho NetMap VN. Next.js 15 (App Router) + TypeScript + Tailwind + MapLibre GL + TanStack Query.

## Quick start

```bash
# Cài deps
yarn install   # hoặc npm install

# Cấu hình API URL (mặc định http://localhost:8080)
cp .env.example .env.local

# Đảm bảo backend đang chạy
cd ../netmap-vn-backend
yarn db:setup
yarn dev      # backend port 8080

# Chạy frontend
cd ../netmap-vn-web
yarn dev      # frontend port 3000
```

Mở http://localhost:3000.

## Pages

- `/` — Bản đồ phủ sóng (MapLibre + heatmap từ `/coverage/heatmap`) + banner sự cố toàn quốc
- `/speedtest` — Đo tốc độ thực, đo qua backend `/measure/{ping,download,upload}`, gửi `POST /speed-tests`
- `/outages` — List sự cố quanh vị trí + form báo sự cố mới
- `/compare` — So sánh nhà mạng theo tỉnh + period + network type, bar chart + chi tiết
- `/leaderboard` — BXH top contributors, theo period (7d / 30d / all)
- `/login` — Flow OTP 2 bước, lưu user/device token vào localStorage
- `/me` — Profile, edit displayName, stats summary, badges earned + progress, push toggle, activity feed
- `/badges` — Tất cả huy hiệu (14) + tiến độ cá nhân nếu đã login
- `/admin` — Dashboard cho operator/admin: stats, carrier breakdown, recent outages + resolve button

## Architecture

```
src/
  app/
    layout.tsx       — Root layout + nav
    providers.tsx    — QueryClientProvider + AuthProvider
    page.tsx         — Trang chủ (map + outage banner)
    leaderboard/page.tsx
    login/page.tsx
    globals.css      — Tailwind + maplibre-gl.css
  components/
    CoverageMap.tsx  — MapLibre với coverage circles
    NationalOutages.tsx
  lib/
    api.ts           — Fetch wrapper, types, endpoints
    auth.tsx         — AuthContext: tokens + currentUser, persist localStorage
```

## Auth model

- **Device token** (90d TTL) — issue khi gọi `/devices/register`. Auto-issue lần đầu user vào trang qua `ensureDeviceRegistered()`.
- **User token** (30d TTL) — issue sau OTP verify. Lưu cùng device token.
- Cả 2 tokens persist trong `localStorage` (`netmap-vn:auth`).
- Device UID generated client-side qua `crypto.randomUUID()`, lưu trong `netmap-vn:device-uid`.

## i18n

UI hỗ trợ Tiếng Việt + English. Chuyển đổi qua dropdown 🇻🇳/🇬🇧 trên header.

- `messages/vi.json`, `messages/en.json` — translation key files
- `src/i18n/config.ts` — list locales, default = `vi`
- `src/i18n/request.ts` — `getRequestConfig` đọc cookie `NEXT_LOCALE` rồi fallback Accept-Language
- `src/i18n/actions.ts` — server action `setLocale(locale)` set cookie + revalidate
- `src/components/LocaleSwitcher.tsx` — dropdown trong Header

**Thêm key mới:**
```json
// messages/vi.json
"checkout": { "submit": "Đặt mua" }
// messages/en.json
"checkout": { "submit": "Place order" }
```
```tsx
const t = useTranslations('checkout');
<button>{t('submit')}</button>
```

**Rich messages** (HTML trong text):
```json
"subtitle": "Welcome to <b>NetMap</b>"
```
```tsx
{t.rich('subtitle', { b: (chunks) => <strong>{chunks}</strong> })}
```

**Plural / interpolation:**
```json
"reportCount": "{count, plural, =0 {No reports} one {# report} other {# reports}}"
```

**Thêm locale mới (vd `zh`):**
1. Add `'zh'` vào `LOCALES` trong `config.ts`
2. Tạo `messages/zh.json`
3. (Optional) Thêm flag emoji vào `LocaleSwitcher.tsx`

Hiện tại đã migrate: `Header`, `page.tsx`, `NationalOutages`. Các pages khác (login, speedtest, outages, compare, leaderboard, me, admin, badges) vẫn còn text VN cứng — migrate dần khi cần.

## PWA

Project là PWA (Progressive Web App):

- `src/app/manifest.ts` — webmanifest auto-served tại `/manifest.webmanifest`
- `src/app/icon.tsx` — 192×192 maskable icon (PNG generated từ React)
- `src/app/apple-icon.tsx` — 180×180 cho iOS Home Screen
- `public/sw.js` — Service Worker:
  - Static assets → cache-first
  - HTML pages → network-first với offline fallback
  - Map tiles → stale-while-revalidate
  - `/api/*` → network-only (luôn fresh, không cache)
- `src/components/ServiceWorkerRegister.tsx` — chỉ register SW trong production
- `src/components/InstallPrompt.tsx` — banner "Cài đặt" khi browser fire `beforeinstallprompt`. Dismiss 7 ngày
- `src/app/offline/page.tsx` — hiển thị khi mất mạng

**Test PWA:**
1. `yarn build && yarn start`
2. Chrome DevTools → Application → Manifest (verify icons + meta)
3. Application → Service Workers (verify SW activated)
4. Network tab → Offline → reload page (vẫn xem được trang đã cache)

## Env vars

| Variable | Default | Mô tả |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | URL backend NetMap |

## Deploy

Vercel hoặc bất kỳ Node host nào. Set `NEXT_PUBLIC_API_URL` thành domain backend prod.
Không có server-side secrets — client-only fetch.

## Map style

- Default: `https://demotiles.maplibre.org/style.json` (free, low-res, OK cho dev/demo)
- Production: set `NEXT_PUBLIC_MAPTILER_KEY` env → tự động dùng MapTiler streets-v2 (free 100k req/mo, đăng ký tại [maptiler.com](https://maptiler.com/))
- Hoặc tự host tile server (OpenMapTiles + MapLibre Tile Server)

`CoverageMap.tsx` tự detect env và switch style URL.
