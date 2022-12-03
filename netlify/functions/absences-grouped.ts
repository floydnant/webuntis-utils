import { handleRequest } from 'netlify/http-helpers';
import { DateRange } from 'netlify/utils/time-utils';
import { getLessonsForSchoolYear } from 'netlify/webuntis';
import { loginUntis, parseCredentials } from 'netlify/webuntis/auth';
import {
    groupAbsenceEntriesByDay,
    joinAbsencesWithLessons,
} from 'netlify/webuntis/compute';
import { digestAbsence, digestLesson } from 'netlify/webuntis/entity-helpers';

export interface AbsencesGroupedResponse {
    dateRange: DateRange;
    count: number;
    absencesGroupedByDay: ReturnType<typeof groupAbsenceEntriesByDay>;
}

export const handler = handleRequest(async (event) => {
    const credentials = parseCredentials(event.body);

    return await loginUntis(
        credentials,
        async (untis): Promise<AbsencesGroupedResponse> => {
            // @TODO: add custom range support
            const { id, name, ...dateRange } =
                await untis.getLatestSchoolyear();

            const lessons = await getLessonsForSchoolYear(untis, dateRange);
            const absences = await untis.getAbsentLesson(
                dateRange.startDate as any,
                dateRange.endDate as any
            );
            const timeGrid = await untis.getTimegrid();

            const lessonsGroupedByAbsences = joinAbsencesWithLessons(
                lessons.map((lesson) => digestLesson(lesson, timeGrid)),
                absences.absences.map(digestAbsence)
            );
            const absencesGroupedByDay = groupAbsenceEntriesByDay(
                lessonsGroupedByAbsences
            );

            return {
                dateRange,
                count: absencesGroupedByDay.length,
                absencesGroupedByDay,
            };
        }
    );
});
