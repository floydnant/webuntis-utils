import { Handler } from '@netlify/functions';
import {
    loginUntis,
    getAbsences,
    getCurrentSchoolYear,
    getLessonsForSchoolYear,
    SubjectData,
    UntisCredentials,
} from '../webuntis';

export const handler: Handler = async (event, _context) => {
    const credentials: UntisCredentials = JSON.parse(event.body || '{}');

    if (
        !credentials.school ||
        !credentials.password ||
        !credentials.username ||
        !credentials.serverUrl
    )
        return {
            statusCode: 400,
            // @TODO: #6 figure out how to correctly handle errors here
            errorMessage:
                'Invalid credentials, please provide school, username, password, and server url.',
        };

    const result = await loginUntis(credentials, async (untis) => {
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

    return {
        statusCode: 200,
        body: JSON.stringify(result),
    };
};
