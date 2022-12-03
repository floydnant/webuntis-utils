import { handleRequest } from 'netlify/http-helpers';
import { DateRange } from 'netlify/utils/time-utils';
import { getLessonsForSchoolYear } from 'netlify/webuntis';
import { loginUntis, parseCredentials } from 'netlify/webuntis/auth';
import { joinLessonsWithAbsences } from 'netlify/webuntis/compute';
import { LessonJoinedWithAbsence } from 'netlify/webuntis/entities.model';
import { digestAbsence, digestLesson } from 'netlify/webuntis/entity-helpers';

export interface AbsencesResponse {
    dateRange: DateRange;
    count: number;
    lessonsWithAbsence: LessonJoinedWithAbsence[];
}

export const handler = handleRequest(async (event) => {
    const credentials = parseCredentials(event.body);

    return await loginUntis(
        credentials,
        async (untis): Promise<AbsencesResponse> => {
            // @TODO: add custom range support
            const { id, name, ...dateRange } =
                await untis.getLatestSchoolyear();

            const lessons = await getLessonsForSchoolYear(untis, dateRange);
            const absences = await untis.getAbsentLesson(
                dateRange.startDate as any,
                dateRange.endDate as any
            );
            const timeGrid = await untis.getTimegrid();

            const lessonsJoinedWithAbsences = joinLessonsWithAbsences(
                lessons.map((lesson) => digestLesson(lesson, timeGrid)),
                absences.absences.map(digestAbsence)
            );

            return {
                dateRange,
                count: lessonsJoinedWithAbsences.length,
                lessonsWithAbsence: lessonsJoinedWithAbsences,
            };
        }
    );
});
