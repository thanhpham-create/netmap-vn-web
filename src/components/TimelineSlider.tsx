'use client';

// Timeline slider — control endDate snapshot cho heatmap.
// Slider value 0..N tương ứng tháng cũ nhất → tháng hiện tại.
// Play button: tự increment value mỗi 1.5s, kết thúc thì pause + reset.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

const TICK_INTERVAL_MS = 1500;

type Props = {
  /** How many months back the timeline covers. Default 12. */
  monthsBack?: number;
  /** Active when null = real-time (no snapshot). */
  endDate: Date | null;
  onChange: (endDate: Date | null) => void;
};

export default function TimelineSlider({ monthsBack = 12, endDate, onChange }: Props) {
  const t = useTranslations('timeline');
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Build list of month buckets [oldest, ..., latest]. Last = now (null = real-time).
  const months = useMemo(() => {
    const arr: Date[] = [];
    const now = new Date();
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i + 1, 0); // end-of-month
      arr.push(d);
    }
    return arr;
  }, [monthsBack]);

  // Slider index — when endDate null, index = months.length (means "real-time")
  const sliderMax = months.length; // index `months.length` = real-time
  const currentIndex = endDate
    ? Math.min(
        sliderMax - 1,
        months.findIndex((m) => m.getTime() >= endDate.getTime()),
      )
    : sliderMax;

  function setIndex(i: number) {
    if (i >= sliderMax) {
      onChange(null);
    } else {
      onChange(months[i]);
    }
  }

  function play() {
    setPlaying(true);
    // Reset to start if at end
    const startIdx = currentIndex >= sliderMax ? 0 : currentIndex;
    setIndex(startIdx);

    let i = startIdx;
    timerRef.current = window.setInterval(() => {
      i += 1;
      if (i > sliderMax) {
        stop();
        return;
      }
      setIndex(i);
    }, TICK_INTERVAL_MS) as unknown as number;
  }

  function stop() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
  }

  // Cleanup on unmount
  useEffect(() => () => stop(), []);

  const label =
    currentIndex >= sliderMax
      ? t('realtime')
      : months[currentIndex]?.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });

  return (
    <div className="flex items-center gap-2 rounded-md bg-white/95 px-2 py-1.5 text-xs shadow-md">
      <button
        onClick={playing ? stop : play}
        aria-label={playing ? t('pause') : t('play')}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-vnred-500 text-white hover:bg-vnred-600 active:scale-95"
      >
        <span aria-hidden>{playing ? '⏸' : '▶'}</span>
      </button>
      <div className="flex-1 min-w-[120px]">
        <input
          type="range"
          min={0}
          max={sliderMax}
          value={currentIndex}
          onChange={(e) => {
            stop();
            setIndex(parseInt(e.target.value));
          }}
          className="w-full accent-vnred-500"
          aria-label={t('slider')}
        />
        <div className="mt-0.5 flex items-center justify-between text-[10px] text-gray-500">
          <span>
            {months[0]?.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' })}
          </span>
          <span className="font-semibold text-vnred-600">{label}</span>
          <span>{t('now')}</span>
        </div>
      </div>
    </div>
  );
}
