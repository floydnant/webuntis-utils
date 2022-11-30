import { createAction, props } from '@ngrx/store';
import { SubjectDigestWithPresence } from 'netlify/webuntis/entities.model';

export const dashboardActions = {
    loadSubjects: createAction('[ Dashboard ] load subjects'),
    loadSubjectsSuccess: createAction(
        '[ Dashboard ] load subjects success',
        props<{ subjects: SubjectDigestWithPresence[] }>()
    ),
    loadSubjectsError: createAction('[ Dashboard ] load subjects error'),
};
