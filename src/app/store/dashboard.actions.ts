import { createAction, props } from '@ngrx/store';
import { DashboardState } from '.';

export const dashboardActions = {
    loadDashboard: createAction(
        '[ Dashboard ] load dashboard',
        props<{ ignoreCache?: boolean }>()
    ),
    loadDashboardSuccess: createAction(
        '[ Dashboard ] load dashboard success',
        props<DashboardState>()
    ),
    loadDashboardError: createAction('[ Dashboard ] load dashboard error'),
};
