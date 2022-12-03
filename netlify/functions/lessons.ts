import { handleRequest } from 'netlify/http-helpers';
import { DateRange } from 'netlify/utils/time-utils';
import { getLessonsForSchoolYear } from 'netlify/webuntis';
import { loginUntis, parseCredentials } from 'netlify/webuntis/auth';
import { LessonReadable } from 'netlify/webuntis/entities.model';
import { digestLesson } from 'netlify/webuntis/entity-helpers';

export interface LessonsResponse {
    dateRange: DateRange;
    lessons: LessonReadable[];
}

export const handler = handleRequest(async (event) => {
    const credentials = parseCredentials(event.body);

    return await loginUntis(
        credentials,
        async (untis): Promise<LessonsResponse> => {
            // @TODO: add custom range support
            const { id, name, ...dateRange } =
                await untis.getLatestSchoolyear();
            const lessons = await getLessonsForSchoolYear(untis, dateRange);
            const timeGrid = await untis.getTimegrid();

            return {
                dateRange,
                lessons: lessons.map((lesson) =>
                    digestLesson(lesson, timeGrid)
                ),
            };
        }
    );
});
