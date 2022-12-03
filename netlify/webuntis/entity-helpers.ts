import {
    getTimeRange,
    parseUntisDate,
    UntisTimeRangeSingleDay,
} from 'netlify/utils/time-utils';
import { Absence, Lesson, ShortData, Timegrid } from 'webuntis';
import {
    AbsenceReadable,
    LessonReadable,
    SubjectDigest,
    SubjectMap,
} from './entities.model';

export const getSubjectId = (subjects: ShortData[]) => {
    return subjects.map((su) => `${su.longname} (${su.name})`).join(', ');
};

export const digestSubjectMap = (subjectMap: SubjectMap) => {
    const subjectEntries = Object.entries(subjectMap);
    const digestedSubjectEntries = subjectEntries.map<[string, SubjectDigest]>(
        ([subjectId, subject]) => {
            const regularLessons = subject.regularLessonIds.length;
            const lessonsCancelled = subject.regularLessonCancelledIds.length;

            return [
                subjectId,
                {
                    subjectId,
                    lsnumbers: Array.from(subject.lsnumbers.values()),
                    regularLessons,
                    lessonsCancelled,
                    lessonsOccured: regularLessons - lessonsCancelled,
                    extraLessons: subject.irregularLessonIds.length,
                },
            ];
        }
    );
    return digestedSubjectEntries;
};

export const digestAbsence = (absence: Absence): AbsenceReadable => {
    const absenceTimeRange = getTimeRange(absence);
    const {
        id,
        isExcused,
        studentName,

        // startDate,
        // endDate,
        // startTime,
        // endTime,

        createDate,
        createdUser,
        lastUpdate,
        updatedUser,
        excuseStatus,
        reason,
        text,
        excuse,
    } = absence;

    return {
        absenceTimeRange,
        // untisTimeRange: {
        //     startDate,
        //     endDate,
        //     startTime,
        //     endTime,
        // },
        id,
        createdAt: new Date(createDate),
        createdBy: createdUser,
        lastUpdatedAt: new Date(lastUpdate),
        lastUpdatedBy: updatedUser,
        studentName,
        text,
        reason,
        isExcused,
        excuseStatus,
        excuseProccessedAt: parseUntisDate(excuse.excuseDate),
    };
};

export const getLessonIndex = (
    untisTimeRange: Omit<UntisTimeRangeSingleDay, 'date'>,
    date: Date,
    timeGrid: Timegrid[]
) => {
    const day = timeGrid.find(({ day }) => day - 1 == date.getDay());

    const lessonStartIndex = day?.timeUnits.find(
        (unit) => unit.startTime == untisTimeRange.startTime
    )?.name;
    const lessonEndIndex = day?.timeUnits.find(
        (unit) => unit.endTime == untisTimeRange.endTime
    )?.name;

    if (lessonStartIndex == lessonEndIndex) return lessonStartIndex + '.';
    return `${lessonStartIndex}. - ${lessonEndIndex}.`;
};

export const digestLesson = (lesson: Lesson, timeGrid: Timegrid[]): LessonReadable => {
    const timeRange = getTimeRange(lesson);
    const lessonNumber = getLessonIndex(lesson, timeRange.startTime, timeGrid);

    return {
        id: lesson.id,
        lessonTimeRange: timeRange,
        lessonNumber: lessonNumber,
        // untisTimeRange: {
        //     date: lesson.date,
        //     startTime: lesson.startTime,
        //     endTime: lesson.endTime,
        // },
        teachers: lesson.te.map((teacher) => teacher.longname).join(', '),
        subject: getSubjectId(lesson.su),
        rooms: lesson.ro
            .map((room) => `${room.name} (${room.longname})`)
            .join(', '),
        code: lesson.code,
        info: lesson.info,
        lsnumber: lesson.lsnumber,
        otherInfo: {
            activityType: lesson.activityType,
            bkRemark: lesson.bkRemark,
            bkText: lesson.bkText,
            lstext: lesson.lstext,
            sg: lesson.sg,
            statflags: lesson.statflags,
            substText: lesson.substText,
        },
    };
};
