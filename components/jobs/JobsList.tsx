"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { JobCard } from "@/components/jobs/JobCard";
import { fetchJobsPageAction } from "@/app/actions/jobs";
import type { JobFilters } from "@/schemas/job.schema";
import type { IJob } from "@/types";

interface JobsListProps {
  initialJobs: IJob[];
  initialSavedIds: string[];
  filters: JobFilters;
  pageSize: number;
  initialHasMore: boolean;
}

export function JobsList({
  initialJobs,
  initialSavedIds,
  filters,
  pageSize,
  initialHasMore,
}: JobsListProps) {
  const [jobs, setJobs] = useState<IJob[]>(initialJobs);
  const [savedIds, setSavedIds] = useState<Set<string>>(
    () => new Set(initialSavedIds),
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // Reset whenever filters change (parent passes a fresh object).
  const filtersKey = JSON.stringify(filters);
  useEffect(() => {
    setJobs(initialJobs);
    setSavedIds(new Set(initialSavedIds));
    setPage(1);
    setHasMore(initialHasMore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, initialJobs, initialSavedIds, initialHasMore]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const next = page + 1;
      const res = await fetchJobsPageAction(filters, next, pageSize);
      setJobs((prev) => {
        const seen = new Set(prev.map((j) => j._id));
        const additions = res.jobs.filter((j) => !seen.has(j._id));
        return prev.concat(additions);
      });
      setSavedIds(new Set(res.savedIds));
      setPage(next);
      setHasMore(res.hasMore);
    } catch (err) {
      console.error("[jobs] failed to load more:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [filters, hasMore, loading, page, pageSize]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <p className="text-gray-500">
          No jobs match your filters. Try adjusting them.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            isSaved={savedIds.has(job._id)}
          />
        ))}
      </div>

      <div
        ref={sentinelRef}
        className="flex items-center justify-center py-10"
        aria-hidden={!hasMore}
      >
        {loading && (
          <span className="inline-flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading more jobs...
          </span>
        )}
        {!hasMore && !loading && jobs.length > pageSize && (
          <span className="text-xs text-gray-400">
            You&rsquo;ve reached the end.
          </span>
        )}
      </div>
    </>
  );
}
