import { doMeetingsConflict, hasScheduleConflict } from "./schedule";
import type { Meeting } from "../types/schedule";

const morningLecture: Meeting = {
  type: "LEC",
  days: ["M", "W"],
  start: "09:00AM",
  end: "09:50AM",
  location: "DCC 308",
  instructor: "Dr. Ada",
  section: "01",
};

const overlappingLecture: Meeting = {
  type: "LEC",
  days: ["W"],
  start: "09:30AM",
  end: "10:20AM",
  location: "LOW 200",
  instructor: "Dr. Hopper",
  section: "02",
};

const backToBackLecture: Meeting = {
  type: "LEC",
  days: ["M", "W"],
  start: "09:50AM",
  end: "10:40AM",
  location: "LOW 300",
  instructor: "Dr. Turing",
  section: "03",
};

const differentDayLecture: Meeting = {
  type: "LEC",
  days: ["T", "R"],
  start: "09:30AM",
  end: "10:20AM",
  location: "SAGE 3201",
  instructor: "Dr. Newton",
  section: "04",
};

const noonLecture: Meeting = {
  type: "LEC",
  days: ["F"],
  start: "12:00PM",
  end: "12:50PM",
  location: "RICKETTS 211",
  instructor: "Dr. Noon",
  section: "05",
};

test("detects conflicts when meetings overlap on a shared day", () => {
  expect(doMeetingsConflict(morningLecture, overlappingLecture)).toBe(true);
  expect(doMeetingsConflict(overlappingLecture, morningLecture)).toBe(true);
});

test("does not report conflicts for back-to-back meetings", () => {
  expect(doMeetingsConflict(morningLecture, backToBackLecture)).toBe(false);
});

test("does not report conflicts for meetings on different days", () => {
  expect(doMeetingsConflict(morningLecture, differentDayLecture)).toBe(false);
});

test("handles noon times correctly when checking for overlap", () => {
  const nearNoonLecture: Meeting = {
    ...noonLecture,
    start: "11:45AM",
    end: "12:15PM",
  };

  expect(doMeetingsConflict(noonLecture, nearNoonLecture)).toBe(true);
});

test("reports whether any meeting in a schedule conflicts with a candidate", () => {
  expect(hasScheduleConflict([morningLecture, differentDayLecture], overlappingLecture)).toBe(true);
  expect(hasScheduleConflict([differentDayLecture, noonLecture], morningLecture)).toBe(false);
});

test("returns false when there are no scheduled meetings to compare", () => {
  expect(hasScheduleConflict([], morningLecture)).toBe(false);
});
