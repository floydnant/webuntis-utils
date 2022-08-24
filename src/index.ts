import WebUntisType, { Absences, Lesson } from "webuntis";
const WebUntis = require("webuntis");
require("dotenv/config");
import { writeFile, readFile } from "fs/promises";
import { join } from "path";

const globalUntis = new WebUntis(
    process.env.SCHOOL,
    process.env.USERNAME,
    process.env.PASSWORD,
    process.env.SERVER_URL
) as WebUntisType;

const currentSchoolYear = {
    name: "2022/2023",
    id: 19,
    startDate: new Date("2022-08-21T22:00:00.000Z"),
    endDate: new Date("2023-07-11T22:00:00.000Z"),
};

const getCurrentSchoolYear = (untis: WebUntisType) => {
    return untis.getLatestSchoolyear();
};

const getLessonsForToday = async (untis: WebUntisType) => {
    const timetable = await untis.getOwnTimetableForToday();
    timetable.forEach((lesson) => console.log(lesson));

    return timetable;
};

const getTimetableForYear = async () => {
    const lessons = await globalUntis.getOwnClassTimetableForRange(
        currentSchoolYear.startDate,
        currentSchoolYear.endDate
    );

    writeFile(
        join(__dirname, "../responses/lessons.json"),
        JSON.stringify(lessons)
    );

    return lessons;
};

const getAbsences = (untis: WebUntisType) => {
    return untis.getAbsentLesson(
        currentSchoolYear.startDate as any,
        currentSchoolYear.endDate as any
    );

    const exampleResponse = {
        absences: [],
        absenceReasons: [],
        excuseStatuses: null,
        showAbsenceReasonChange: false,
        showCreateAbsence: false,
    };
};

// globalUntis.login().then(async () => {
//     getCurrentSchoolYear(globalUntis);

//     const absences = await getAbsences(globalUntis);
//     // absences.absences.forEach(a => a.)
//     console.log(absences);

//     const subjects = await globalUntis.getSubjects(); // if this is neede, we should cashe that
//     // subjects.forEach(s => s.)
//     console.log(subjects);

//     const departments = await globalUntis.getDepartments();
//     // departments.forEach(d => d.)
//     console.log(departments);

//     globalUntis.logout();
// });

// @TODO: make this automatically fetch the new data once a day (only fetch new data, when response is one day old)
readFile(join(__dirname, "../responses/lessons.json")).then(async (file) => {
    const contents = file.toString();
    const lessons: Lesson[] = JSON.parse(contents);

    const subjectIds = new Set<number>();
    const subjects = new Map<
        number,
        { name: string; total: number; cancelled: number }
    >();

    console.log({
        "lessons total": lessons.length,
        "lessons irregular": lessons.filter((l) => l.code == "irregular")
            .length,
        "lessons cancelled": lessons.filter((l) => l.code == "cancelled")
            .length,
    });

    lessons.forEach((lesson) => {
        if (lesson.code == "irregular") return;

        lesson.su.forEach((su) => {
            subjectIds.add(su.id);
            const subjectFromMap = subjects.get(su.id);
            subjects.set(su.id, {
                name: `${su.longname} (${su.name})`,
                total: (subjectFromMap?.total || 0) + 1,
                cancelled:
                    (subjectFromMap?.cancelled || 0) +
                    (lesson.code == "cancelled" ? 1 : 0),
            });
        });
    });
    console.log("subject count:", subjectIds.size);
    console.log("subjects:", subjects);
});
