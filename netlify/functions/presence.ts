import { handleRequest } from 'netlify/http-helpers';
import { loginUntis, parseCredentials } from 'netlify/webuntis/auth';
import {
    getAbsences,
    getCurrentSchoolYear,
    getLessonsForSchoolYear,
    SubjectData,
} from '../webuntis';

export const handler = handleRequest(async (event) => {
    const credentials = parseCredentials(event.body);

    return await loginUntis(credentials, async (untis) => {
        const schoolYear = await getCurrentSchoolYear(untis);
        const lessons = await getLessonsForSchoolYear(untis, schoolYear);

        const absences = await getAbsences(untis, schoolYear, lessons);

        const subjects = absences.map<SubjectData>(([subjectId, absence]) => {
            const actualLessons =
                absence.lessonsTotal - absence.lessonsCancelled;
            const presenceInPercent = (
                ((actualLessons - (absence.lessonsMissed || 0)) /
                    actualLessons) *
                100
            ).toFixed(2);

            return {
                ...absence,
                subjectId,
                presence: parseFloat(presenceInPercent),
                lessonsMissed: absence.lessonsMissed || 0,
            };
        });

        return subjects;
    });
});
