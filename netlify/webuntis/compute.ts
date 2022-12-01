import { getTimeRangeOverlap } from 'netlify/utils/time-utils';
import { Lesson } from 'webuntis';
import {
    LessonJoinedWithAbsence,
    AbsenceReadable,
    LessonReadable,
    SubjectMap,
} from './entities.model';
import { getSubjectId } from './entity-helpers';

export const getSubjectsFromLessons = (lessons: Lesson[]) => {
    const subjectMap: SubjectMap = {};

    lessons.forEach((lesson) => {
        if (!lesson.su.length) return;

        const subjectId = getSubjectId(lesson.su);
        const prevSubjectEntry = subjectMap[subjectId];

        if (prevSubjectEntry) {
            // if the lesson is marked as irregular dont add it to regular
            if (lesson.code == 'irregular')
                prevSubjectEntry.irregularLessonIds.push(lesson.id);
            else prevSubjectEntry.regularLessonIds.push(lesson.id);

            if (lesson.code == 'cancelled')
                prevSubjectEntry.regularLessonCancelledIds.push(lesson.id);

            prevSubjectEntry.lsnumbers.add(lesson.lsnumber);
        } else
            subjectMap[subjectId] = {
                lsnumbers: new Set([lesson.lsnumber]),
                regularLessonIds: lesson.code == 'irregular' ? [] : [lesson.id],
                regularLessonCancelledIds:
                    lesson.code == 'cancelled' ? [lesson.id] : [],
                irregularLessonIds:
                    lesson.code == 'irregular' ? [lesson.id] : [],
            };
    });

    return subjectMap;
};

export const joinLessonsWithAbsences = (
    untisLessons: LessonReadable[],
    absencesReadable: AbsenceReadable[]
) => {
    const absencesByLesson = untisLessons
        .map(({ lessonTimeRange, ...lessonReadable }) => {
            const absencesOverlapping = absencesReadable
                .map(({ absenceTimeRange, ...untisAbsence }) => {
                    const { isOverlapping, overlap } = getTimeRangeOverlap(
                        lessonTimeRange,
                        absenceTimeRange
                    );

                    return {
                        isAbsenceWithinLessonTime: isOverlapping,
                        overlap,
                        ...absenceTimeRange,
                        ...untisAbsence,
                    };
                })
                .filter((a) => a.isAbsenceWithinLessonTime);

            return {
                lesson: { ...lessonTimeRange, ...lessonReadable },
                absencesOverlapping,
            };
        })
        .filter((lesson) => lesson.absencesOverlapping.length);

    const lessonsJoinedWithAbsences =
        absencesByLesson.flatMap<LessonJoinedWithAbsence>(
            ({ lesson, absencesOverlapping }) => {
                return absencesOverlapping.map(
                    ({ isAbsenceWithinLessonTime, overlap, ...absence }) => ({
                        absenceOverlapWithLesson: overlap,
                        absence,
                        lesson,
                    })
                );
            }
        );

    return lessonsJoinedWithAbsences;
};

export const joinAbsencesWithLessons = (
    digestedLessons: LessonReadable[],
    digestedAbsences: AbsenceReadable[]
) => {
    const absenceGroups = digestedAbsences.map((absence) => {
        const { absenceTimeRange, ...restAbsence } = absence;

        const lessons = digestedLessons
            .map((lesson) => {
                const { lessonTimeRange, ...restLesson } = lesson;

                const { isOverlapping, overlap } = getTimeRangeOverlap(
                    lessonTimeRange,
                    absenceTimeRange
                );

                return {
                    isOverlapping,
                    overlap,
                    ...lessonTimeRange,
                    ...restLesson,
                };
            })
            .filter(({ isOverlapping }) => isOverlapping)
            .map(({ isOverlapping, ...lesson }) => lesson)
            .sort(
                (a, b) =>
                    new Date(a.startTime).valueOf() -
                    new Date(b.startTime).valueOf()
            );

        return {
            ...absenceTimeRange,
            ...restAbsence,
            lessons,
        };
    });

    return absenceGroups
        .sort(
            (a, b) =>
                new Date(a.startTime).valueOf() -
                new Date(b.startTime).valueOf()
        )
        .reverse();
};

export const groupAbsenceEntriesByDay = (
    absenceEntries: ReturnType<typeof joinAbsencesWithLessons>
) => {
    const dayAbsenceMap: Record<string, typeof absenceEntries> = {};

    absenceEntries.forEach((entry) => {
        const year = entry.startTime.getFullYear();
        const month = entry.startTime.getMonth();
        const day = entry.startTime.getDate();

        const timestamp = new Date(year, month, day).toISOString();

        if (dayAbsenceMap[timestamp]) dayAbsenceMap[timestamp].push(entry);
        else dayAbsenceMap[timestamp] = [entry];
    });

    return Object.entries(dayAbsenceMap).map(([timestamp, absenceGroup]) => ({
        timestamp,
        absenceGroup: absenceGroup.sort(
            (a, b) => a.startTime.valueOf() - b.startTime.valueOf()
        ),
    }));
};
