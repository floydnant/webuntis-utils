import {
    TimeRangeWithDuration,
    UntisTimeRangeMultiDay,
    UntisTimeRangeSingleDay,
} from 'netlify/utils/time-utils';

export type SubjectMap = Record<
    string,
    {
        lsnumbers: Set<number>;
        regularLessonIds: number[];
        regularLessonCancelledIds: number[];
        irregularLessonIds: number[];
    }
>;
export interface SubjectDigest {
    subjectId: string;
    lsnumbers: number;
    regularLessons: number;
    lessonsCancelled: number;
    lessonsOccured: number;
    extraLessons: number;
}
export interface SubjectDigestWithPresence extends SubjectDigest {
    lessonsLate: number;
    lessonsAbsent: number;
    lessonsPresent: number;
    presenceInPercent: number;
}

export interface AbsenceReadable {
    absenceTimeRange: TimeRangeWithDuration;
    untisTimeRange: UntisTimeRangeMultiDay;
    untisAbsence: {
        id: number;
        createdAt: Date;
        createdBy: string;
        lastUpdatedAt: Date;
        lastUpdatedBy: string;
        studentName: string;
        isExcused: boolean;
        excuseStatus: string;
        reason: string;
        text: string;
    };
}

export interface LessonReadable {
    id: number;
    lessonTimeRange: TimeRangeWithDuration;
    untisTimeRange: UntisTimeRangeSingleDay;
    teachers: string;
    subject: string;
    rooms: string;
    code?: 'cancelled' | 'irregular';
    info?: string;
    otherInfo: {
        activityType?: string;
        bkRemark?: string;
        bkText?: string;
        lsnumber: number;
        lstext?: string;
        sg?: string;
        statflags?: string;
        substText?: string;
    };
}

// @TODO: not quite happy with this, lets rethink and get it cleaner
export interface LessonJoinedWithAbsence {
    startTime: Date;
    endTime: Date;
    absenceDuration: number;
    absenceOverlapWithLesson: number;
    absence: {
        id: number;
        createdAt: Date;
        createdBy: string;
        lastUpdatedAt: Date;
        lastUpdatedBy: string;
        studentName: string;
        isExcused: boolean;
        excuseStatus: string;
        reason: string;
        text: string;
    };
    lesson: {
        id: number;
        teachers: string;
        subject: string;
        rooms: string;
        code?: 'cancelled' | 'irregular';
        info?: string;
        otherInfo: {
            activityType?: string;
            bkRemark?: string;
            bkText?: string;
            lsnumber: number;
            lstext?: string;
            sg?: string;
            statflags?: string;
            substText?: string;
        };
        duration: number;
        startTime: Date;
        endTime: Date;
    };
}
