import { strict as assert } from "node:assert";
import { deadlineStatus } from "../src/course_failover.ts";

const request = { learner: "Mina", course: "Algebra I", deadline: "2030-05-20", completedLessons: 7, totalLessons: 10 };
assert.equal(deadlineStatus(request, new Date("2030-05-15T12:00:00Z")), "on-track");
assert.equal(deadlineStatus(request, new Date("2030-05-21T12:00:00Z")), "overdue");
console.log("deadline decisions pass");
