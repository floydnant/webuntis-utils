import { handleRequest } from 'netlify/http-helpers';
import { loginUntis, parseCredentials } from 'netlify/webuntis/auth';
import { getSubjectsFromLessons } from 'netlify/webuntis/compute';
import { digestSubjectMap } from 'netlify/webuntis/entity-helpers';
import { getLessonsForSchoolYear } from '../webuntis';

export const handler = handleRequest(async (event) => {
    const credentials = parseCredentials(event.body);

    return await loginUntis(credentials, async (untis) => {
        // @TODO: add custom range support
        const { id, name, ...dateRange } = await untis.getLatestSchoolyear();
        const lessons = await getLessonsForSchoolYear(untis, dateRange);

        const subjectDigests = digestSubjectMap(
            getSubjectsFromLessons(lessons)
        ).map(([, subjectDigest]) => subjectDigest);

        return {
            dateRange,
            subjectDigests,
        };
    });
});
