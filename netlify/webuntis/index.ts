import WebUntisType, { Lesson, ShortData } from 'webuntis';

interface SchoolYear {
    startDate: Date;
    endDate: Date;
}

export const getSubjectId = (subjects: ShortData[]) => {
    return subjects.map((su) => `${su.longname} (${su.name})`).join(', ');
};

export const getCurrentSchoolYear = (untis: WebUntisType) => {
    return untis.getLatestSchoolyear();
};

export const getLessonsForToday = async (untis: WebUntisType) => {
    const timetable = await untis.getOwnTimetableForToday();
    timetable.forEach((lesson) => console.log(lesson));

    return timetable;
};

export const getLessonsForSchoolYear = async (
    untis: WebUntisType,
    schoolYear: SchoolYear
) => {
    const lessons = await untis.getOwnClassTimetableForRange(
        schoolYear.startDate,
        schoolYear.endDate
    );

    return lessons;
};

export const reduceSubjects = (lessons: Lesson[]) => {
    const subjects = new Map<string, Omit<SubjectData, 'presence'>>();

    lessons.forEach((lesson) => {
        if (lesson.code == 'irregular') return;
        const subjectId = getSubjectId(lesson.su);

        const subjectFromMap = subjects.get(subjectId);
        subjects.set(subjectId, {
            lessonsTotal: (subjectFromMap?.lessonsTotal || 0) + 1,
            lessonsCancelled:
                (subjectFromMap?.lessonsCancelled || 0) +
                (lesson.code == 'cancelled' ? 1 : 0),
            lessonsMissed: null,
        });
    });

    return subjects;
};

export interface SubjectData {
    lessonsTotal: number;
    lessonsCancelled: number;
    lessonsMissed: null | number;
    presence: number;
}

export const getAbsences = async (
    untis: WebUntisType,
    schoolYear: SchoolYear,
    allYearsLessons: Lesson[]
) => {
    // @TODO: #7 this should only fetch absences of the current Semester
    const untisAbsences = await untis.getAbsentLesson(
        schoolYear.startDate as any,
        schoolYear.endDate as any
    );
    const lessonsTakenPlace = allYearsLessons.filter(
        (l) => l.code != 'cancelled' && l.code != 'irregular'
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
