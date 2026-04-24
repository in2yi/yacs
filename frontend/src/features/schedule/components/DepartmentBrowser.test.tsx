import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import DepartmentBrowser from "./DepartmentBrowser";
import { useSchedule } from "../context/schedule-context";
import type { Course } from "../types/schedule";

jest.mock("../context/schedule-context", () => ({
  useSchedule: jest.fn(),
}));

const mockUseSchedule = useSchedule as jest.MockedFunction<typeof useSchedule>;

const sampleCourses: Course[] = [
  {
    id: "CSCI-1100",
    title: "Computer Science I",
    credits: 4,
    level: "1100",
    department: "CSCI",
    school: "Computer Science",
    description: "Introduction to programming and computational problem solving.",
    offerFrequency: "Fall and Spring",
    prereqs: [],
    coreqs: [],
    maxEnroll: 120,
    enrolled: 100,
    meetings: [],
  },
  {
    id: "CSCI-1200",
    title: "Data Structures",
    credits: 4,
    level: "1200",
    department: "CSCI",
    school: "Computer Science",
    description: "Lists, trees, graphs, and algorithmic thinking.",
    offerFrequency: "Spring",
    prereqs: ["CSCI-1100"],
    coreqs: [],
    maxEnroll: 90,
    enrolled: 81,
    meetings: [],
  },
  {
    id: "MATH-1010",
    title: "Calculus I",
    credits: 4,
    level: "1010",
    department: "MATH",
    school: "Mathematical Sciences",
    description: "Differential calculus for science and engineering majors.",
    offerFrequency: "Fall, Spring, Summer",
    prereqs: [],
    coreqs: [],
    maxEnroll: 200,
    enrolled: 177,
    meetings: [],
  },
];

function renderBrowser(overrides: Partial<ReturnType<typeof useSchedule>> = {}) {
  const addCourse = jest.fn();
  const hasCourse = jest.fn().mockReturnValue(false);

  mockUseSchedule.mockReturnValue({
    filteredCatalog: sampleCourses,
    addCourse,
    hasCourse,
    courses: [],
    removeCourse: jest.fn(),
    clear: jest.fn(),
    catalog: sampleCourses,
    selectedSemester: "All Semesters",
    availableSemesters: ["All Semesters"],
    setSelectedSemester: jest.fn(),
    loadCsv: jest.fn(),
    ...overrides,
  });

  return {
    addCourse,
    hasCourse,
    ...render(<DepartmentBrowser />),
  };
}

beforeEach(() => {
  mockUseSchedule.mockReset();
});

test("shows an empty state when no catalog courses are available", () => {
  renderBrowser({ filteredCatalog: [], catalog: [] });

  expect(screen.getByRole("button", { name: /all departments/i })).toBeInTheDocument();
  expect(screen.getByText(/no matching courses found/i)).toBeInTheDocument();
  expect(screen.getByText(/0 courses found/i)).toBeInTheDocument();
});

test("lists departments with counts and filters visible courses by department", () => {
  renderBrowser();

  expect(screen.getByRole("button", { name: /all departments/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /csci/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /math/i })).toBeInTheDocument();
  expect(screen.getByText(/3 courses found/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /math/i }));

  expect(screen.getByText(/1 course found/i)).toBeInTheDocument();
  expect(screen.getByText(/math-1010: calculus i/i)).toBeInTheDocument();
  expect(screen.queryByText(/csci-1100: computer science i/i)).not.toBeInTheDocument();
});

test("filters courses by search query inside the selected department", () => {
  renderBrowser();

  fireEvent.click(screen.getByRole("button", { name: /csci/i }));
  fireEvent.change(screen.getByPlaceholderText(/search within department/i), {
    target: { value: "data" },
  });

  expect(screen.getByText(/csci-1200: data structures/i)).toBeInTheDocument();
  expect(screen.queryByText(/csci-1100: computer science i/i)).not.toBeInTheDocument();
});

test("shows a no-results state when the department search has no matches", () => {
  renderBrowser();

  fireEvent.change(screen.getByPlaceholderText(/search within department/i), {
    target: { value: "quantum" },
  });

  expect(screen.getByText(/no matching courses found/i)).toBeInTheDocument();
});

test("adds a course to the schedule and disables courses that are already added", () => {
  const hasCourse = jest.fn((courseId: string) => courseId === "CSCI-1200");
  const { addCourse } = renderBrowser({ hasCourse });

  fireEvent.click(screen.getAllByRole("button", { name: /add to schedule/i })[0]);

  expect(addCourse).toHaveBeenCalledWith(sampleCourses[0]);
  expect(screen.getByRole("button", { name: /added/i })).toBeDisabled();
});
