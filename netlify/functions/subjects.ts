import { handleRequest } from 'netlify/http-helpers';
import { loginUntis, parseCredentials } from 'netlify/webuntis/auth';
import { getSubjectsFromLessons } from 'netlify/webuntis/compute';
import { SubjectDigest } from 'netlify/webuntis/entities.model';
import { digestSubjectMap } from 'netlify/webuntis/entity-helpers';
import { getLessonsForSchoolYear } from '../webuntis';

export interface SubjectsResponse {
    dateRange: {
        startDate: Date;
        endDate: Date;
    };
    subjectDigests: SubjectDigest[];
}

export const handler = handleRequest(async (event) => {
    const credentials = parseCredentials(event.body);

    return await loginUntis(
        credentials,
        async (untis): Promise<SubjectsResponse> => {
            // @TODO: add custom range support
            const { id, name, ...dateRange } =
                await untis.getLatestSchoolyear();
            const lessons = await getLessonsForSchoolYear(untis, dateRange);

            const subjectDigests = digestSubjectMap(
                getSubjectsFromLessons(lessons)
            ).map(([, subjectDigest]) => subjectDigest);

            return {
                dateRange,
                subjectDigests,
            };
        }
    );
});
