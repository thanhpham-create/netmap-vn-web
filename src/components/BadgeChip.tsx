type BadgeProps = {
  emoji: string;
  name: string;
  description?: string;
  earned?: boolean;
  progress?: number;
  threshold?: number;
  size?: 'sm' | 'md';
};

export function BadgeChip({ emoji, name, earned = true, size = 'md' }: BadgeProps) {
  const cls = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${cls} ${
        earned
          ? 'bg-amber-100 text-amber-800 border border-amber-200'
          : 'bg-gray-100 text-gray-400 border border-gray-200'
      }`}
      title={name}
    >
      <span className={earned ? '' : 'grayscale'}>{emoji}</span>
      <span>{name}</span>
    </span>
  );
}

export function BadgeCard({ emoji, name, description, earned, progress, threshold }: BadgeProps) {
  const pct = threshold ? Math.min(100, ((progress ?? 0) / threshold) * 100) : 0;
  return (
    <div className={`rounded-md border p-3 ${earned ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl ${
          earned ? 'bg-amber-100' : 'bg-gray-100 grayscale opacity-50'
        }`}>
          {emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`font-semibold ${earned ? 'text-amber-900' : 'text-gray-700'}`}>{name}</p>
          {description && <p className="text-xs text-gray-500">{description}</p>}
          {!earned && threshold !== undefined && progress !== undefined && (
            <div className="mt-1.5">
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-0.5 text-[10px] text-gray-400 tabular-nums">
                {progress} / {threshold}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
