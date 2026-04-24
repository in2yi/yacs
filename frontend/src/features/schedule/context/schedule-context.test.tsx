import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ScheduleProvider, useSchedule } from "./schedule-context";
import { fetchText } from "@/api";

jest.mock("@/api", () => ({
  fetchText: jest.fn(),
}));

const mockFetchText = fetchText as jest.MockedFunction<typeof fetchText>;

const sampleCsv = `course_name,course_type,course_credit_hours,course_days_of_the_week,course_start_time,course_end_time,course_instructor,course_location,course_max_enroll,course_enrolled,course_level,course_section,short_name,full_name,description,raw_precoreqs,offer_frequency,prerequisites,corequisites,school
Intro to CS,LEC,4,MWF,09:00AM,09:50AM,Dr. Ada,DCC 308,120,118,1100,01,CSCI-1100,Computer Science I,Intro course,,Fall and Spring,[],[],Computer Science
Data Structures,LEC,4,TR,10:00AM,11:50AM,Dr. Hopper,LOW 200,90,82,1200,01,CSCI-1200,Data Structures,Follow-up course,,Spring,[""CSCI-1100""],[],Computer Science`;

function ScheduleHarness() {
  const {
    catalog,
    filteredCatalog,
    courses,
    selectedSemester,
    setSelectedSemester,
    loadCsv,
    addCourse,
    removeCourse,
    clear,
  } = useSchedule();

  return (
    <div>
      <div data-testid="selected-semester">{selectedSemester}</div>
      <div data-testid="catalog-count">{catalog.length}</div>
      <div data-testid="filtered-count">{filteredCatalog.length}</div>
      <div data-testid="course-count">{courses.length}</div>
      <div data-testid="filtered-ids">{filteredCatalog.map((course) => course.id).join(",")}</div>
      <button type="button" onClick={() => loadCsv("/catalog.csv")}>
        Load catalog
      </button>
      <button type="button" onClick={() => setSelectedSemester("Spring 2026")}>
        View spring
      </button>
      <button
        type="button"
        onClick={() => {
          if (catalog[0]) {
            addCourse(catalog[0]);
          }
        }}
      >
        Add first course
      </button>
      <button
        type="button"
        onClick={() => {
          if (catalog[0]) {
            removeCourse(catalog[0].id);
          }
        }}
      >
        Remove first course
      </button>
      <button type="button" onClick={clear}>
        Clear courses
      </button>
    </div>
  );
}

function renderHarness() {
  return render(
    <ScheduleProvider>
      <ScheduleHarness />
    </ScheduleProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  mockFetchText.mockReset();
});

test("hydrates and persists the selected semester", async () => {
  localStorage.setItem("yacs.selectedSemester", "Spring 2026");

  renderHarness();

  expect(screen.getByTestId("selected-semester")).toHaveTextContent("Spring 2026");

  fireEvent.click(screen.getByRole("button", { name: /view spring/i }));

  await waitFor(() => {
    expect(localStorage.getItem("yacs.selectedSemester")).toBe("Spring 2026");
  });
});

test("loads the catalog from csv text and filters courses by semester", async () => {
  mockFetchText.mockResolvedValue(sampleCsv);

  renderHarness();

  fireEvent.click(screen.getByRole("button", { name: /load catalog/i }));

  await waitFor(() => {
    expect(screen.getByTestId("catalog-count")).toHaveTextContent("2");
  });
  expect(screen.getByTestId("filtered-ids")).toHaveTextContent("CSCI-1100,CSCI-1200");
  expect(mockFetchText).toHaveBeenCalledWith("/catalog.csv");

  fireEvent.click(screen.getByRole("button", { name: /view spring/i }));

  await waitFor(() => {
    expect(screen.getByTestId("filtered-count")).toHaveTextContent("2");
  });
});

test("adds, deduplicates, removes, and clears scheduled courses", async () => {
  mockFetchText.mockResolvedValue(sampleCsv);

  renderHarness();

  fireEvent.click(screen.getByRole("button", { name: /load catalog/i }));

  await waitFor(() => {
    expect(screen.getByTestId("catalog-count")).toHaveTextContent("2");
  });

  fireEvent.click(screen.getByRole("button", { name: /add first course/i }));
  fireEvent.click(screen.getByRole("button", { name: /add first course/i }));

  expect(screen.getByTestId("course-count")).toHaveTextContent("1");

  fireEvent.click(screen.getByRole("button", { name: /remove first course/i }));
  expect(screen.getByTestId("course-count")).toHaveTextContent("0");

  fireEvent.click(screen.getByRole("button", { name: /add first course/i }));
  expect(screen.getByTestId("course-count")).toHaveTextContent("1");

  fireEvent.click(screen.getByRole("button", { name: /clear courses/i }));
  expect(screen.getByTestId("course-count")).toHaveTextContent("0");
});
