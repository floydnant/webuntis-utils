import { Handler } from "@netlify/functions";
import {
    loginUntis,
    getAbsences,
    getCurrentSchoolYear,
    getLessonsForSchoolYear,
    SubjectData,
    UntisCredentials,
} from "../../src";

export const handler: Handler = async (event, context) => {
    const credentials: UntisCredentials = JSON.parse(event.body || "{}");
    if (
        !credentials.school ||
        !credentials.password ||
        !credentials.username ||
        !credentials.serverUrl
    )
        return {
            statusCode: 400,
            errorMessage:
                "Invalid credentials, please provide school, username, password, and server url.",
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
