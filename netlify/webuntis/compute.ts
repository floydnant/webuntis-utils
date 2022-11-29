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

// @TODO: not quite happy with this, lets rethink and get it cleaner
export const joinLessonsWithAbsences = (
    untisLessons: LessonReadable[],
    absencesReadable: AbsenceReadable[]
) => {
    const absencesByLesson = untisLessons
        .map(({ lessonTimeRange, ...lessonReadable }) => {
            const absencesOverlapping = absencesReadable
                .map(({ untisAbsence, absenceTimeRange }) => {
                    const { isOverlapping, overlap } = getTimeRangeOverlap(
                        lessonTimeRange,
                        absenceTimeRange
                    );

                    return {
                        isAbsenceWithinLessonTime: isOverlapping,
                        overlap,
                        absenceTimeRange,
                        ...untisAbsence,
                    };
                })
                .filter((a) => a.isAbsenceWithinLessonTime);

            return {
                lesson: { ...lessonTimeRange, ...lessonReadable },
                absences: absencesOverlapping,
            };
        })
        .filter((lesson) => lesson.absences.length);

    const absenceJoinedWithLesson =
        absencesByLesson.flatMap<LessonJoinedWithAbsence>(
            ({ lesson: { untisTimeRange, ...lesson }, absences }) => {
                return absences.map(
                    ({
                        isAbsenceWithinLessonTime,
                        overlap,
                        absenceTimeRange: { duration, ...timeRange },
                        ...absence
                    }) => ({
                        ...timeRange,
                        absenceDuration: duration,
                        absenceOverlapWithLesson: overlap,
                        absence,
                        lesson,
                    })
                );
            }
        );

    return absenceJoinedWithLesson;
};
