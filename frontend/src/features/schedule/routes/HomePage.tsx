import React from "react";
import ScheduleList from "../components/ScheduleList";
import WeekScheduler from "../components/WeekScheduler";
import DepartmentBrowser from "../components/DepartmentBrowser";
import ClassSearch from "../components/ClassSearch";
import { useSchedule } from "../context/schedule-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

function SearchSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}

function DepartmentBrowserSkeleton() {
  return (
    <section className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-4 space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-11 w-full max-w-sm rounded-xl" />
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-border bg-background p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-64 max-w-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-9 w-32 rounded-md" />
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SchedulerSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
      <Skeleton className="h-[420px] w-full rounded-2xl" />
    </div>
  );
}

function ScheduleListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>

      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <Skeleton className="h-5 w-56 max-w-full" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const {
    selectedSemester,
    catalog,
    isCatalogLoading,
    catalogError,
    reloadCatalog,
  } = useSchedule();
  const isInitialCatalogLoad = isCatalogLoading && catalog.length === 0;

  return (
    <main className="flex-1 p-4">
      <div className="mb-6 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Schedule</h1>
          <p className="text-sm text-muted-foreground">Semester: {selectedSemester}</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <div className="mb-3 flex flex-col gap-1">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Course Search
            </h2>
            <p className="text-sm text-muted-foreground">
              Search the full semester catalog and add classes directly to your schedule.
            </p>
          </div>
          {isInitialCatalogLoad ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                <Spinner className="size-4 text-footer" />
                <span>Loading the course catalog for search...</span>
              </div>
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ) : (
            <ClassSearch />
          )}
        </div>
      </div>

      {catalogError && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-300/60 bg-red-50 px-4 py-4 text-red-800 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Catalog load failed</p>
            <p className="text-sm opacity-90">
              {catalogError}. You can retry without leaving the page.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void reloadCatalog()}
            disabled={isCatalogLoading}
            className="border-red-300 bg-transparent text-red-800 hover:bg-red-100 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-900/40"
          >
            {isCatalogLoading ? (
              <>
                <Spinner className="size-4" />
                Retrying...
              </>
            ) : (
              "Retry catalog load"
            )}
          </Button>
        </div>
      )}

      {isCatalogLoading && catalog.length > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground shadow-sm">
          <Spinner className="size-4 text-footer" />
          <span>Refreshing the course catalog and schedule browser...</span>
        </div>
      )}

      {isInitialCatalogLoad ? <DepartmentBrowserSkeleton /> : <DepartmentBrowser />}

      <div className="mt-8 space-y-6">
        {isInitialCatalogLoad ? (
          <>
            <SchedulerSkeleton />
            <ScheduleListSkeleton />
          </>
        ) : (
          <>
            <WeekScheduler events={[]} startHour={8} endHour={20} showWeekend={false} />
            <ScheduleList />
          </>
        )}
      </div>
    </main>
  );
}
