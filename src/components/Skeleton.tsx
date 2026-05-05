// Generic skeleton placeholders for loading states.

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded border bg-gray-50 p-2">
      <Skeleton className="mb-2 h-3 w-1/3" />
      <Skeleton className="h-2.5 w-2/3" />
    </div>
  );
}

export function EmptyState({
  icon = '📭',
  title,
  hint,
}: {
  icon?: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-gray-50 p-8 text-center">
      <span className="text-3xl">{icon}</span>
      <p className="font-medium text-gray-700">{title}</p>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
