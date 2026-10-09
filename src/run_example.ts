import { createEducatorReport } from "./course_failover.ts";

const result = await createEducatorReport({ learner: "Mina", course: "Algebra I", deadline: "2030-05-20", completedLessons: 7, totalLessons: 10 });
console.log(JSON.stringify(result, null, 2));
