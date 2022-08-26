import WebUntisType, { Absences, Lesson, ShortData } from "webuntis";
const WebUntis = require("webuntis");
require("dotenv/config");
import { writeFile, readFile } from "fs/promises";
import { join } from "path";

interface Credentials {
    school: string;
    username: string;
    password: string;
    serverUrl: string;
}
interface SchoolYear {
    startDate: Date;
    endDate: Date;
}

const getSubjectId = (subjects: ShortData[]) => {
    return subjects.map((su) => `${su.longname} (${su.name})`).join(", ");
};

const getCurrentSchoolYear = (untis: WebUntisType) => {
    return untis.getLatestSchoolyear();
};

const getLessonsForToday = async (untis: WebUntisType) => {
    const timetable = await untis.getOwnTimetableForToday();
    timetable.forEach((lesson) => console.log(lesson));

    return timetable;
};

const getLessonsForSchoolYear = async (
    untis: WebUntisType,
    schoolYear: SchoolYear
) => {
    const lessons = await untis.getOwnClassTimetableForRange(
        schoolYear.startDate,
        schoolYear.endDate
    );

    writeFile(
        join(__dirname, "../responses/lessons.json"),
        JSON.stringify(lessons)
    );

    return lessons;
};

const reduceSubjects = (lessons: Lesson[]) => {
    const subjects = new Map<string, Omit<SubjectData, "presence">>();

    lessons.forEach((lesson) => {
        if (lesson.code == "irregular") return;
        const subjectId = getSubjectId(lesson.su);

        const subjectFromMap = subjects.get(subjectId);
        subjects.set(subjectId, {
            lessonsTotal: (subjectFromMap?.lessonsTotal || 0) + 1,
            lessonsCancelled:
                (subjectFromMap?.lessonsCancelled || 0) +
                (lesson.code == "cancelled" ? 1 : 0),
            lessonsMissed: null,
        });
    });

    return subjects;
};

interface SubjectData {
    lessonsTotal: number;
    lessonsCancelled: number;
    lessonsMissed: null | number;
    presence: number;
}

const getAbsences = async (
    untis: WebUntisType,
    schoolYear: SchoolYear,
    allYearsLessons: Lesson[]
) => {
    // @TODO: this should only fetch absences of the current Semester
    const untisAbsences = await untis.getAbsentLesson(
        schoolYear.startDate as any,
        schoolYear.endDate as any
    );
    const lessonsTakenPlace = allYearsLessons.filter(
        (l) => l.code != "cancelled" && l.code != "irregular"
    );

    const subjectLessonsMap = reduceSubjects(allYearsLessons);

    const lessonsMissed = untisAbsences.absences
        .map((absence) => {
            const lessonsMissed = lessonsTakenPlace
                .filter((lesson) => {
                    const isLessonOnAbsenceDay =
                        lesson.date >= absence.startDate &&
                        lesson.date <= absence.endDate;

                    // @TODO: clarify the school rules (wether being late counts to the 70% rule)
                    const isLessonWithinAbsenceTime =
                        lesson.startTime <= absence.startTime &&
                        lesson.endTime >= absence.endTime;

                    return isLessonOnAbsenceDay && isLessonWithinAbsenceTime;
                })
                .map(({ su }) => ({ subjectId: getSubjectId(su) }));

            return lessonsMissed;
        })
        .flat(1);

    lessonsMissed.forEach(({ subjectId }) => {
        const subjectStats = subjectLessonsMap.get(subjectId)!;

        subjectLessonsMap.set(subjectId, {
            ...subjectStats,
            lessonsMissed: (subjectStats.lessonsMissed || 0) + 1,
        });
    });

    return [...subjectLessonsMap.entries()];
};

const loginUntis = async (
    { school, username, password, serverUrl }: Credentials,
    callback: (untis: WebUntisType) => Promise<any>
) => {
    const untis = new WebUntis(
        school,
        username,
        password,
        serverUrl
    ) as WebUntisType;
    await untis.login();
    await callback(untis);
    await untis.logout();
};

readFile(join(__dirname, "../responses/lessons.json")).then(async (file) => {
    const contents = file.toString();
    const lessons: Lesson[] = JSON.parse(contents);

    const currentSchoolYear = {
        name: "2022/2023",
        id: 19,
        startDate: new Date("2022-08-21T22:00:00.000Z"),
        endDate: new Date("2023-07-11T22:00:00.000Z"),
    };

    loginUntis(
        {
            school: process.env.SCHOOL!,
            username: process.env.USERNAME!,
            password: process.env.PASSWORD!,
            serverUrl: process.env.SERVER_URL!,
        },
        async (untis) => {
            // getCurrentSchoolYear(untis);
            // getLessonsForSchoolYear(untis)

            const absences = await getAbsences(
                untis,
                currentSchoolYear,
                lessons
            );

            const subjects = absences.map<SubjectData>(([subjectId, absence]) => {
                const actualLessons =
                    absence.lessonsTotal - absence.lessonsCancelled;
                const presenceInPercent = (
                    ((actualLessons - (absence.lessonsMissed || 0)) /
                        actualLessons) *
                    100
                ).toFixed(2);

                return {
                    ...absence,
                    subjectId,
                    presence: parseFloat(presenceInPercent),
                    lessonsMissed: absence.lessonsMissed || 0,
                };
            });
            console.log("Absences:", subjects);
        }
    );
});
