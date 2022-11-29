import { handleRequest } from 'netlify/http-helpers';
import { getLessonsForSchoolYear } from 'netlify/webuntis';
import { loginUntis, parseCredentials } from 'netlify/webuntis/auth';
import { joinLessonsWithAbsences } from 'netlify/webuntis/compute';
import { digestAbsence, digestLesson } from 'netlify/webuntis/entity-helpers';

export const handler = handleRequest(async (event) => {
    const credentials = parseCredentials(event.body);

    return await loginUntis(credentials, async (untis) => {
        // @TODO: add custom range support
        const dateRange = await untis.getLatestSchoolyear();

        const lessons = await getLessonsForSchoolYear(untis, dateRange);
        const absences = await untis.getAbsentLesson(
            dateRange.startDate as any,
            dateRange.endDate as any
        );

        const lessonsJoinedWithAbsences = joinLessonsWithAbsences(
            lessons.map(digestLesson),
            absences.absences.map(digestAbsence)
        );

        return {
            dateRange,
            count: lessonsJoinedWithAbsences.length,
            lessonsWithAbsence: lessonsJoinedWithAbsences,
        };
    });
});
