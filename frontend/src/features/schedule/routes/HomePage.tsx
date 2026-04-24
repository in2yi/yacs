import React from "react";
import ScheduleList from "../components/ScheduleList";
import WeekScheduler from "../components/WeekScheduler";
import DepartmentBrowser from "../components/DepartmentBrowser";
import ClassSearch from "../components/ClassSearch";
import { useSchedule } from "../context/schedule-context";

export default function HomePage() {
  const { selectedSemester } = useSchedule();

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
          <ClassSearch />
        </div>
      </div>

      <DepartmentBrowser />

      <div className="mt-8 space-y-6">
        <WeekScheduler events={[]} startHour={8} endHour={20} showWeekend={false} />
        <ScheduleList />
      </div>
    </main>
  );
}
