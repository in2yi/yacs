import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import ClassSearch from "./ClassSearch";
import { useSchedule } from "../context/schedule-context";
import type { Course } from "../types/schedule";

jest.mock("../context/schedule-context", () => ({
  useSchedule: jest.fn(),
}));

jest.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: ({ count, estimateSize }: { count: number; estimateSize: () => number }) => ({
    getTotalSize: () => count * estimateSize(),
    getVirtualItems: () =>
      Array.from({ length: count }, (_, index) => ({
        index,
        start: index * estimateSize(),
      })),
  }),
}));

jest.mock("@/hooks/useDebouncedValue", () => ({
  useDebouncedValue: <T,>(value: T) => value,
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
    description: "Introduction to programming.",
    offerFrequency: "Fall and Spring",
    prereqs: [],
    coreqs: [],
    maxEnroll: 120,
    enrolled: 118,
    meetings: [
      { type: "LEC", days: ["M", "W"], start: "09:00AM", end: "09:50AM", location: "DCC 308", instructor: "Dr. Ada", section: "01" },
      { type: "LAB", days: ["F"], start: "01:00PM", end: "01:50PM", location: "LOW 100", instructor: "Dr. Ada", section: "L1" },
      { type: "LAB", days: ["F"], start: "02:00PM", end: "02:50PM", location: "LOW 101", instructor: "Dr. Ada", section: "L2" },
    ],
  },
  {
    id: "CSCI-1200",
    title: "Data Structures",
    credits: 4,
    level: "1200",
    department: "CSCI",
    school: "Computer Science",
    description: "Lists, trees, and graphs.",
    offerFrequency: "Spring",
    prereqs: ["CSCI-1100"],
    coreqs: [],
    maxEnroll: 90,
    enrolled: 81,
    meetings: [
      { type: "LEC", days: ["T", "R"], start: "10:00AM", end: "11:50AM", location: "LOW 200", instructor: "Dr. Hopper", section: "01" },
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
      { type: "LEC", days: ["M", "T"], start: "08:00AM", end: "09:50AM", location: "SAGE 3201", instructor: "Dr. Newton", section: "01" },
    ],
  },
];

function renderSearch(overrides: Partial<ReturnType<typeof useSchedule>> = {}, props: Partial<React.ComponentProps<typeof ClassSearch>> = {}) {
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

  const portal = document.createElement("div");
  portal.id = props.dropdownContainerId ?? "class-search-results-slot";
  document.body.appendChild(portal);

  const view = render(<ClassSearch {...props} />);

  return {
    ...view,
    addCourse,
    hasCourse,
    portal,
  };
}

beforeEach(() => {
  mockUseSchedule.mockReset();
  document.body.innerHTML = "";
});

test("opens the dropdown and shows the available class results", () => {
  renderSearch();

  fireEvent.focus(screen.getByRole("combobox"));

  expect(screen.getByRole("listbox", { name: /search results/i })).toBeInTheDocument();
  expect(screen.getByText(/csci-1100 - computer science i/i)).toBeInTheDocument();
  expect(screen.getByText(/math-1010 - calculus i/i)).toBeInTheDocument();
});

test("filters search results by course id or title and can clear the query", () => {
  renderSearch();

  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "data" },
  });

  expect(screen.getByText(/csci-1200 - data structures/i)).toBeInTheDocument();
  expect(screen.queryByText(/csci-1100 - computer science i/i)).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /clear search/i }));

  expect(screen.getByRole("combobox")).toHaveValue("");
  expect(screen.getByText(/csci-1100 - computer science i/i)).toBeInTheDocument();
});

test("shows a no-results message when no classes match the query", () => {
  renderSearch();

  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "quantum" },
  });

  expect(screen.getByText(/no classes found/i)).toBeInTheDocument();
});

test("adds the default meeting selection for a course result", () => {
  const { addCourse } = renderSearch();

  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "csci-1100" },
  });
  fireEvent.click(screen.getByText(/csci-1100 - computer science i/i));

  expect(addCourse).toHaveBeenCalledTimes(1);
  expect(addCourse).toHaveBeenCalledWith({
    ...sampleCourses[0],
    meetings: [sampleCourses[0].meetings[0], sampleCourses[0].meetings[1]],
  });
});

test("marks already-added courses as disabled and does not add them again", () => {
  const hasCourse = jest.fn((courseId: string) => courseId === "CSCI-1200");
  const { addCourse } = renderSearch({ hasCourse });

  fireEvent.focus(screen.getByRole("combobox"));

  const disabledOption = screen.getByText(/csci-1200 - data structures/i).closest('[role="option"]');
  expect(disabledOption).toHaveAttribute("aria-disabled", "true");

  fireEvent.click(screen.getByText(/csci-1200 - data structures/i));

  expect(addCourse).not.toHaveBeenCalled();
});

test("limits the visible results and shows the refine-search hint", () => {
  renderSearch({}, { maxResults: 2 });

  fireEvent.focus(screen.getByRole("combobox"));

  expect(screen.queryByText(/math-1010 - calculus i/i)).not.toBeInTheDocument();
  expect(screen.getByText(/showing first 2 results/i)).toBeInTheDocument();
});

test("closes the dropdown on escape and outside clicks", () => {
  renderSearch();

  const input = screen.getByRole("combobox");
  fireEvent.focus(input);
  expect(screen.getByRole("listbox")).toBeInTheDocument();

  fireEvent.keyDown(input, { key: "Escape" });
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

  fireEvent.focus(input);
  expect(screen.getByRole("listbox")).toBeInTheDocument();

  fireEvent.mouseDown(document.body);
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
});
