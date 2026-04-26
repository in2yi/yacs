import { useEffect } from "react";
import { useSchedule } from "../context/schedule-context";

export default function CatalogLoader({ path = "/test-schedule.csv" }: { path?: string }) {
  const { loadCsv } = useSchedule();

  useEffect(() => {
    void loadCsv(path).catch(() => undefined);
  }, [loadCsv, path]);

  return null;
}
