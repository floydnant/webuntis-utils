import { handleRequest } from 'netlify/http-helpers';
import { getLessonsForSchoolYear } from 'netlify/webuntis';
import { loginUntis, parseCredentials } from 'netlify/webuntis/auth';
import { digestLesson } from 'netlify/webuntis/entity-helpers';

export const handler = handleRequest(async (event) => {
    const credentials = parseCredentials(event.body);

    return await loginUntis(credentials, async (untis) => {
        // @TODO: add custom range support
        const { id, name, ...dateRange } = await untis.getLatestSchoolyear();
        const lessons = await getLessonsForSchoolYear(untis, dateRange);

        return {
            dateRange,
            lessons: lessons.map(digestLesson),
        };
    });
});
