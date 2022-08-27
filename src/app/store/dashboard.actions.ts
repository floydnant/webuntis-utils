import { createAction, props } from '@ngrx/store';
import { SubjectData } from '.';

export const dashboardActions = {
    loadSubjects: createAction('[ Dashboard ] load subjects'),
    loadSubjectsSuccess: createAction(
        '[ Dashboard ] load subjects success',
        props<{ subjects: SubjectData[] }>()
    ),
};
