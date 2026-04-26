import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CatalogLoader from "@/features/schedule/components/CatalogLoader";
import { appConfig } from "@/config";
import { useSchedule } from "@/features/schedule/context/schedule-context";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export default function App() {
  const { isCatalogLoading, catalogError, reloadCatalog, catalog } = useSchedule();
  const isRefreshingCatalog = isCatalogLoading && catalog.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <CatalogLoader path={appConfig.catalogCsvPath} />
      <Navbar />
      {(isRefreshingCatalog || catalogError) && (
        <div className="border-b border-border bg-surface/85 px-4 py-2 shadow-sm backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {isRefreshingCatalog ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Spinner className="size-4 text-footer" />
                <span>Refreshing course data across your planner and schedule views...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm text-red-800 dark:text-red-200">
                <span className="inline-flex size-4 items-center justify-center rounded-full bg-red-500/15 text-[10px] font-bold text-red-700 dark:text-red-300">
                  !
                </span>
                <span>{catalogError}</span>
              </div>
            )}

            {catalogError && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void reloadCatalog()}
                disabled={isCatalogLoading}
                className="self-start sm:self-auto"
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
            )}
          </div>
        </div>
      )}
      <Outlet /> 
      <Footer />
    </div>
  );
}
