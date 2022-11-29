import { DateRange } from 'netlify/utils/time-utils';
import WebUntisType from 'webuntis';

export const getLessonsForToday = async (untis: WebUntisType) => {
    const timetable = await untis.getOwnTimetableForToday();
    timetable.forEach((lesson) => console.log(lesson));

    return timetable;
};

export const getLessonsForSchoolYear = async (
    untis: WebUntisType,
    dateRange: DateRange
) => {
    const lessons = await untis.getOwnClassTimetableForRange(
        dateRange.startDate,
        dateRange.endDate
    );

    return lessons;
};
