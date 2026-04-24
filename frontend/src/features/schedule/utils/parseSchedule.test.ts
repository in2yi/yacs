import { parseCoursesFromCsvText } from "./parseSchedule";

const csvText = `course_name,course_type,course_credit_hours,course_days_of_the_week,course_start_time,course_end_time,course_instructor,course_location,course_max_enroll,course_enrolled,course_level,course_section,short_name,full_name,description,raw_precoreqs,offer_frequency,prerequisites,corequisites,school
Computer Science I,LEC,4,MWF,09:00AM,09:50AM,Dr. Ada,DCC 308,120,118,1100,01,CSCI-1100,Computer Science I,Intro to programming,,Fall and Spring,"['MATH 1010']",[],Computer Science
Computer Science I,LAB,4,F,01:00PM,01:50PM,TA Lin,LOW 100,120,118,1100,L1,CSCI-1100,Computer Science I,Intro to programming,,Fall and Spring,"['MATH 1010']",[],Computer Science
Data Structures,LEC,4,TR,10:00AM,11:50AM,Dr. Hopper,LOW 200,90,81,1200,01,CSCI-1200,Data Structures,Lists and trees,,Spring,['CSCI 1100'],"['MATH 1010']",Computer Science
Calculus I,LEC,4,MR,08:00AM,09:50AM,Dr. Newton,SAGE 3201,200,177,1010,01,MATH1010,Calculus I,Differential calculus,,Fall,"not-json","['PHYS 1100']",Mathematical Sciences`;

test("groups multiple csv rows for the same course into one course record", () => {
  const courses = parseCoursesFromCsvText(csvText);

  expect(courses).toHaveLength(3);

  const cs1 = courses.find((course) => course.id === "CSCI-1100");
  expect(cs1).toBeDefined();
  expect(cs1?.meetings).toHaveLength(2);
  expect(cs1?.meetings.map((meeting) => meeting.type)).toEqual(["LEC", "LAB"]);
});

test("parses course metadata, numeric fields, and array prerequisites/corequisites", () => {
  const courses = parseCoursesFromCsvText(csvText);
  const dataStructures = courses.find((course) => course.id === "CSCI-1200");

  expect(dataStructures).toMatchObject({
    title: "Data Structures",
    credits: 4,
    level: "1200",
    department: "CSCI",
    school: "Computer Science",
    description: "Lists and trees",
    offerFrequency: "Spring",
    prereqs: ["CSCI 1100"],
    coreqs: ["MATH 1010"],
    maxEnroll: 90,
    enrolled: 81,
  });
});

test("splits compact day strings into individual meeting days", () => {
  const courses = parseCoursesFromCsvText(csvText);
  const cs1 = courses.find((course) => course.id === "CSCI-1100");
  const math = courses.find((course) => course.id === "MATH1010");

  expect(cs1?.meetings[0].days).toEqual(["M", "W", "F"]);
  expect(math?.meetings[0].days).toEqual(["M", "R"]);
});

test("derives the department from dashed and undashed course ids", () => {
  const courses = parseCoursesFromCsvText(csvText);
  const cs1 = courses.find((course) => course.id === "CSCI-1100");
  const math = courses.find((course) => course.id === "MATH1010");

  expect(cs1?.department).toBe("CSCI");
  expect(math?.department).toBe("MATH");
});

test("falls back to empty arrays when prerequisite/corequisite fields are malformed", () => {
  const courses = parseCoursesFromCsvText(csvText);
  const math = courses.find((course) => course.id === "MATH1010");

  expect(math?.prereqs).toEqual([]);
  expect(math?.coreqs).toEqual(["PHYS 1100"]);
});

test("keeps meeting-level details from each csv row", () => {
  const courses = parseCoursesFromCsvText(csvText);
  const cs1 = courses.find((course) => course.id === "CSCI-1100");

  expect(cs1?.meetings[1]).toMatchObject({
    type: "LAB",
    days: ["F"],
    start: "01:00PM",
    end: "01:50PM",
    location: "LOW 100",
    instructor: "TA Lin",
    section: "L1",
  });
});
