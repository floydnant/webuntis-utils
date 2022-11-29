export const parseUntisTime = (untisTime: number) => {
    const timeStr = untisTime.toString();
    return {
        minutes: parseInt(timeStr.slice(-2)),
        hours: parseInt(timeStr.slice(0, -2)),
    };
};

export const parseUntisDate = (untisDate: number, untisTime?: number) => {
    const dateStr = untisDate.toString();
    const year = parseInt(dateStr.slice(0, 4));
    const month = parseInt(dateStr.slice(4, 6)) - 1;
    const day = parseInt(dateStr.slice(-2));

    if (!untisTime) return new Date(year, month, day);

    const { hours, minutes } = parseUntisTime(untisTime);
    const date = new Date(year, month, day, hours, minutes);
    // @TODO: keep an eye on this, it might fuck things over later
    date.setUTCHours(hours);

    return date;
};

export interface UntisTimeRangeMultiDay {
    startTime: number;
    endTime: number;
    startDate: number;
    endDate: number;
}
export interface UntisTimeRangeSingleDay {
    startTime: number;
    endTime: number;
    date: number;
}
export type UntisTimeRange = UntisTimeRangeMultiDay | UntisTimeRangeSingleDay;

export interface DateRange {
    startDate: Date;
    endDate: Date;
}
export interface TimeRange {
    startTime: Date;
    endTime: Date;
}
export interface TimeRangeWithDuration extends TimeRange {
    /** in minutes */
    duration: number;
}

export const getTimeRange = (range: UntisTimeRange): TimeRangeWithDuration => {
    const startDate = 'date' in range ? range.date : range.startDate;
    const endDate = 'date' in range ? range.date : range.endDate;

    // const startTime = WebUntisType.convertUntisTime(
    //     range.startTime,
    //     WebUntisType.convertUntisDate(range.startDate)
    // );
    // startTime.setHours(startTime.getHours() + 2);
    const startTime = parseUntisDate(startDate, range.startTime);

    // const endTime = WebUntisType.convertUntisTime(
    //     range.endTime,
    //     WebUntisType.convertUntisDate(range.endDate)
    // );
    // endTime.setHours(endTime.getHours() + 2);
    const endTime = parseUntisDate(endDate, range.endTime);

    const duration = (endTime.valueOf() - startTime.valueOf()) / 1000 / 60; // convert ms to minutes;

    return {
        startTime,
        endTime,
        duration,
    };
};

export const getTimeRangeOverlap = (a: TimeRange, b: TimeRange) => {
    const aStart = a.startTime.valueOf();
    const aEnd = a.endTime.valueOf();

    const bStart = b.startTime.valueOf();
    const bEnd = b.endTime.valueOf();

    const isOverlapping = Math.max(aStart, bStart) <= Math.min(aEnd, bEnd);
    const overlap =
        (Math.min(aEnd, bEnd) - Math.max(aStart, bStart)) / 1000 / 60;

    return {
        isOverlapping,
        /** in minutes */ overlap,
    };
};
