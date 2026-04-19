import { Skeleton } from '@/components/ui/skeleton';

export function FeedLoadingSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}
