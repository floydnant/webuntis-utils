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
    lsnumbers: number[];
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
    // untisTimeRange: UntisTimeRangeMultiDay;
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
    excuseProccessedAt: Date;
}

export interface LessonReadable {
    id: number;
    lessonTimeRange: TimeRangeWithDuration;
    // untisTimeRange: UntisTimeRangeSingleDay;
    teachers: string;
    subject: string;
    rooms: string;
    code?: 'cancelled' | 'irregular';
    info?: string;
    lsnumber: number;
    otherInfo: {
        activityType?: string;
        bkRemark?: string;
        bkText?: string;
        lstext?: string;
        sg?: string;
        statflags?: string;
        substText?: string;
    };
}

export interface LessonJoinedWithAbsence {
    absenceOverlapWithLesson: number;
    absence: Omit<AbsenceReadable, 'absenceTimeRange'> & TimeRangeWithDuration;
    lesson: Omit<LessonReadable, 'lessonTimeRange'> & TimeRangeWithDuration;
}
