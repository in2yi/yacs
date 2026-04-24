import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import ScheduleList from "./ScheduleList";
import { useSchedule } from "../context/schedule-context";
import type { Course } from "../types/schedule";

jest.mock("../context/schedule-context", () => ({
  useSchedule: jest.fn(),
}));

const mockUseSchedule = useSchedule as jest.MockedFunction<typeof useSchedule>;

const courseOne: Course = {
  id: "CSCI-1100",
  title: "Computer Science I",
  credits: 4,
  level: "1100",
  department: "CSCI",
  school: "Computer Science",
  description: "Introduction to programming.",
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
};

const courseTwo: Course = {
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
      days: ["M", "W"],
      start: "09:30AM",
      end: "10:20AM",
      location: "SAGE 3201",
      instructor: "Dr. Newton",
      section: "01",
    },
  ],
};

const catalogCourses: Course[] = [
  {
    ...courseOne,
    meetings: [
      courseOne.meetings[0],
      {
        type: "LEC",
        days: ["T", "R"],
        start: "11:00AM",
        end: "11:50AM",
        location: "DCC 318",
        instructor: "Dr. Ada",
        section: "02",
      },
      {
        type: "LAB",
        days: ["F"],
        start: "01:00PM",
        end: "01:50PM",
        location: "LOW 100",
        instructor: "TA Lin",
        section: "L1",
      },
      {
        type: "LAB",
        days: ["M", "W"],
        start: "09:30AM",
        end: "10:20AM",
        location: "LOW 101",
        instructor: "TA Lin",
        section: "L2",
      },
    ],
  },
  courseTwo,
];

function renderList(overrides: Partial<ReturnType<typeof useSchedule>> = {}) {
  const removeCourse = jest.fn();
  const clear = jest.fn();
  const addCourse = jest.fn();

  mockUseSchedule.mockReturnValue({
    courses: [courseOne, courseTwo],
    removeCourse,
    clear,
    addCourse,
    catalog: catalogCourses,
    filteredCatalog: catalogCourses,
    hasCourse: jest.fn(),
    selectedSemester: "All Semesters",
    availableSemesters: ["All Semesters"],
    setSelectedSemester: jest.fn(),
    loadCsv: jest.fn(),
    ...overrides,
  });

  return {
    removeCourse,
    clear,
    addCourse,
    ...render(<ScheduleList />),
  };
}

function getCourseHeader(title: string) {
  const heading = screen.getByText(title, { exact: false });
  return heading.closest("div[class*='cursor-pointer']") as HTMLDivElement;
}

beforeEach(() => {
  mockUseSchedule.mockReset();
});

test("shows an empty-state message when no classes are selected", () => {
  renderList({ courses: [] });

  expect(screen.getByText(/no classes selected yet/i)).toBeInTheDocument();
  expect(screen.getByText(/0 courses selected/i)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /clear all/i })).not.toBeInTheDocument();
});

test("shows selected course count and clears the schedule", () => {
  const { clear } = renderList();

  expect(screen.getByText(/2 courses selected/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /clear all/i }));

  expect(clear).toHaveBeenCalledTimes(1);
});

test("removes a selected course from its card actions", () => {
  const { removeCourse, container } = renderList();

  const cardHeading = screen.getByText(/csci-1100/i);
  const card = cardHeading.closest("div[class*='rounded-xl']") as HTMLDivElement;
  const buttons = within(card).getAllByRole("button");

  fireEvent.click(buttons[0]);

  expect(removeCourse).toHaveBeenCalledWith("CSCI-1100");
});

test("expands a course and shows available section choices", () => {
  renderList();

  fireEvent.click(getCourseHeader("Computer Science I"));

  expect(screen.getByText(/lec sections/i)).toBeInTheDocument();
  expect(screen.getByText(/lab sections/i)).toBeInTheDocument();
  expect(screen.getAllByText(/selected: lec-01/i).length).toBeGreaterThan(0);
});

test("shows a fallback message when the catalog has no section data for a selected course", () => {
  renderList({ catalog: [{ ...courseTwo, meetings: [] }], courses: [courseTwo] });

  fireEvent.click(getCourseHeader("Calculus I"));

  expect(screen.getByText(/no section data available/i)).toBeInTheDocument();
});

test("marks strict conflicts and highlights conflicting alternative sections", () => {
  renderList();

  fireEvent.click(getCourseHeader("Computer Science I"));

  expect(screen.getByText("CONFLICT")).toBeInTheDocument();
  expect(screen.getAllByText(/conflict/i).length).toBeGreaterThan(0);
});

test("replaces the selected meeting choice when a different section is picked", () => {
  const { removeCourse, addCourse } = renderList({ courses: [courseOne] });

  fireEvent.click(getCourseHeader("Computer Science I"));
  fireEvent.click(screen.getByText(/lec 02/i));

  expect(removeCourse).toHaveBeenCalledWith("CSCI-1100");
  expect(addCourse).toHaveBeenCalledWith({
    ...courseOne,
    meetings: [
      {
        type: "LEC",
        days: ["T", "R"],
        start: "11:00AM",
        end: "11:50AM",
        location: "DCC 318",
        instructor: "Dr. Ada",
        section: "02",
      },
    ],
  });
});
