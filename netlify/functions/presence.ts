import { handleRequest } from 'netlify/http-helpers';
import { DateRange } from 'netlify/utils/time-utils';
import { loginUntis, parseCredentials } from 'netlify/webuntis/auth';
import {
    joinLessonsWithAbsences,
    getSubjectsFromLessons,
    groupAbsenceEntriesByDay,
    joinAbsencesWithLessons,
} from 'netlify/webuntis/compute';
import {
    LessonJoinedWithAbsence,
    SubjectDigestWithPresence,
} from 'netlify/webuntis/entities.model';
import {
    digestSubjectMap,
    digestAbsence,
    digestLesson,
} from 'netlify/webuntis/entity-helpers';
import { getLessonsForSchoolYear } from '../webuntis';

export interface PresenceResponse {
    dateRange: DateRange;
    subjectDigestsWithPresences: SubjectDigestWithPresence[];
    lessonsWithAbsence: LessonJoinedWithAbsence[];
    absencesGroupedByDay: ReturnType<typeof groupAbsenceEntriesByDay>;
}

export const handler = handleRequest(async (event) => {
    const credentials = parseCredentials(event.body);

    return await loginUntis(
        credentials,
        async (untis): Promise<PresenceResponse> => {
            // const schoolYear = await untis.getLatestSchoolyear();

            // @TODO: add custom range support / semester choosing feature
            const dateRange: DateRange = {
                startDate: new Date(2022, 7, 22),
                endDate: new Date(2023, 0, 30),
            };

            const lessons = await getLessonsForSchoolYear(untis, dateRange);
            const untisAbsences = await untis.getAbsentLesson(
                dateRange.startDate as any,
                dateRange.endDate as any
            );
            const timeGrid = await untis.getTimegrid();

            const digestedLessons = lessons.map((lesson) =>
                digestLesson(lesson, timeGrid)
            );
            const digestedAbsences = untisAbsences.absences.map(digestAbsence);

            const lessonsJoinedWithAbsences = joinLessonsWithAbsences(
                digestedLessons,
                digestedAbsences
            );

            const subjectDigestEntries = digestSubjectMap(
                getSubjectsFromLessons(lessons)
            );
            const subjectMap = Object.fromEntries(
                subjectDigestEntries.map(([subjectId, subjectData]) => {
                    return [
                        subjectId,
                        {
                            ...subjectData,
                            lessonsAbsent: 0,
                            lessonsLate: 0,
                        },
                    ];
                })
            );

            // Count absences
            lessonsJoinedWithAbsences.forEach((absence) => {
                if (!absence.lesson.subject) return;
                const subjectEntry = subjectMap[absence.lesson.subject];

                if (absence.absenceOverlapWithLesson <= 20)
                    subjectEntry.lessonsLate++;

                if (
                    absence.absenceOverlapWithLesson > 20 &&
                    absence.absenceOverlapWithLesson < 45
                ) {
                    subjectEntry.lessonsAbsent =
                        subjectEntry.lessonsAbsent + 0.5;
                }

                if (absence.absenceOverlapWithLesson >= 45)
                    subjectEntry.lessonsAbsent++;
            });

            // Calculate presence
            const subjectDigestsWithPresences = Object.entries(
                subjectMap
            ).map<SubjectDigestWithPresence>(
                ([, { lessonsAbsent, lessonsOccured, ...subjectDigest }]) => {
                    const lessonsPresent = lessonsOccured - lessonsAbsent;
                    const presenceInPercent = parseFloat(
                        ((lessonsPresent / lessonsOccured) * 100).toFixed(2)
                    );

                    return {
                        ...subjectDigest,
                        lessonsOccured,
                        //
                        lessonsAbsent,
                        lessonsPresent,
                        presenceInPercent,
                    };
                }
            );

            const lessonsGroupedByAbsences = joinAbsencesWithLessons(
                digestedLessons,
                digestedAbsences
            );
            const absencesGroupedByDay = groupAbsenceEntriesByDay(
                lessonsGroupedByAbsences
            );

            return {
                dateRange,
                subjectDigestsWithPresences,
                lessonsWithAbsence: lessonsJoinedWithAbsences,
                absencesGroupedByDay,
            };
        }
    );
});
