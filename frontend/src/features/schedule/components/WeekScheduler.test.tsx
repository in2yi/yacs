import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import WeekScheduler, {
  computeEventPosition,
  formatClock12h,
  formatTime12h,
  parseTimeToMinutes,
} from "./WeekScheduler";
import { useSchedule } from "../context/schedule-context";
import type { Course } from "../types/schedule";

jest.mock("../context/schedule-context", () => ({
  useSchedule: jest.fn(),
}));

const mockUseSchedule = useSchedule as jest.MockedFunction<typeof useSchedule>;

const courseSchedule: Course[] = [
  {
    id: "CSCI-1100",
    title: "Computer Science I",
    credits: 4,
    level: "1100",
    department: "CSCI",
    school: "Computer Science",
    description: "Intro to programming.",
    offerFrequency: "Fall and Spring",
    prereqs: [],
    coreqs: [],
    maxEnroll: 120,
    enrolled: 118,
    meetings: [
      {
        type: "LEC",
        days: ["M", "W"],
        start: "09:00AM",
        end: "09:50AM",
        location: "DCC 308",
        instructor: "Dr. Ada",
        section: "01",
      },
    ],
  },
  {
    id: "MATH-1010",
    title: "Calculus I",
    credits: 4,
    level: "1010",
    department: "MATH",
    school: "Mathematical Sciences",
    description: "Differential calculus.",
    offerFrequency: "Fall and Spring",
    prereqs: [],
    coreqs: [],
    maxEnroll: 200,
    enrolled: 177,
    meetings: [
      {
        type: "LEC",
        days: ["S"],
        start: "11:00AM",
        end: "11:50AM",
        location: "SAGE 3201",
        instructor: "Dr. Newton",
        section: "01",
      },
    ],
  },
];

function renderScheduler(
  props: Partial<React.ComponentProps<typeof WeekScheduler>> = {},
  courses: Course[] = courseSchedule
) {
  mockUseSchedule.mockReturnValue({
    courses,
    filteredCatalog: courses,
    addCourse: jest.fn(),
    removeCourse: jest.fn(),
    clear: jest.fn(),
    hasCourse: jest.fn(),
    catalog: courses,
    selectedSemester: "All Semesters",
    availableSemesters: ["All Semesters"],
    setSelectedSemester: jest.fn(),
    loadCsv: jest.fn(),
  });

  return render(<WeekScheduler {...props} />);
}

beforeEach(() => {
  mockUseSchedule.mockReset();
});

test("parses time strings into minutes across am/pm and 24-hour formats", () => {
  expect(parseTimeToMinutes("12:00AM")).toBe(0);
  expect(parseTimeToMinutes("09:15AM")).toBe(555);
  expect(parseTimeToMinutes("12:30PM")).toBe(750);
  expect(parseTimeToMinutes("13:45")).toBe(825);
  expect(parseTimeToMinutes("")).toBe(0);
});

test("formats scheduler times into 12-hour labels", () => {
  expect(formatTime12h(0)).toBe("12AM");
  expect(formatTime12h(555)).toBe("9:15AM");
  expect(formatTime12h(720)).toBe("12PM");
  expect(formatClock12h("13:05")).toBe("1:05PM");
});

test("computes event positions within the visible grid and clamps overflow", () => {
  expect(computeEventPosition("09:00AM", "10:00AM", 8, 20)).toEqual({
    topPct: expect.closeTo(8.333333, 5),
    heightPct: expect.closeTo(8.333333, 5),
    duration: 60,
  });

  expect(computeEventPosition("06:00AM", "09:00AM", 8, 20)).toEqual({
    topPct: 0,
    heightPct: expect.closeTo(8.333333, 5),
    duration: 60,
  });
});

test("renders weekday headers and scheduled events from the schedule context", () => {
  renderScheduler({ showWeekend: false });

  expect(screen.getByText("Mon")).toBeInTheDocument();
  expect(screen.getByText("Fri")).toBeInTheDocument();
  expect(screen.queryByText("Sat")).not.toBeInTheDocument();
  expect(screen.getAllByText("Computer Science I").length).toBeGreaterThan(0);
  expect(screen.getByText("9AM")).toBeInTheDocument();
});

test("renders explicit events and calls the click handler with the selected event", () => {
  const onEventClick = jest.fn();

  renderScheduler(
    {
      events: [
        {
          key: "custom-1",
          id: "ITWS-1220",
          title: "IT and Society",
          location: "LOW 4050",
          day: 1,
          start: "10:00AM",
          end: "11:50AM",
        },
      ],
      onEventClick,
    },
    []
  );

  fireEvent.click(screen.getByRole("button", { name: /it and society/i }));

  expect(onEventClick).toHaveBeenCalledWith(
    expect.objectContaining({
      key: "custom-1",
      id: "ITWS-1220",
      title: "IT and Society",
    })
  );
});

test("shows weekend columns when requested", () => {
  renderScheduler({ showWeekend: true });

  expect(screen.getByText("Sat")).toBeInTheDocument();
  expect(screen.getByText("Sun")).toBeInTheDocument();
  expect(screen.getAllByText("Calculus I").length).toBeGreaterThan(0);
});

test("shows a conflict summary and hides the grid when events overlap", () => {
  renderScheduler(
    {
      events: [
        {
          key: "course-a",
          id: "CSCI-1100",
          title: "Computer Science I",
          day: 0,
          start: "09:00AM",
          end: "10:00AM",
        },
        {
          key: "course-b",
          id: "MATH-1010",
          title: "Calculus I",
          day: 0,
          start: "09:30AM",
          end: "10:20AM",
        },
      ],
    },
    []
  );

  expect(screen.getByText(/schedule conflicts detected/i)).toBeInTheDocument();
  expect(screen.getByRole("list")).toBeInTheDocument();
  expect(screen.getByText("Computer Science I")).toBeInTheDocument();
  expect(screen.getByText("Calculus I")).toBeInTheDocument();
  expect(screen.queryByText("8AM")).not.toBeInTheDocument();
});
