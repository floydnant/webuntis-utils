import { DateRange } from 'netlify/utils/time-utils';
import WebUntis from 'webuntis';

export const getLessonsForToday = async (untis: WebUntis) => {
    const timetable = await untis.getOwnTimetableForToday();
    timetable.forEach((lesson) => console.log(lesson));

    return timetable;
};

export const getLessonsForSchoolYear = async (
    untis: WebUntis,
    dateRange: DateRange
) => {
    const lessons = await untis.getOwnClassTimetableForRange(
        dateRange.startDate,
        dateRange.endDate
    );

    return lessons;
};
