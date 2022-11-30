import { createReducer, on } from '@ngrx/store';
import { DashboardState } from '.';
import { dashboardActions } from './dashboard.actions';
import { userDataActions } from './user-data.actions';

const initialState: DashboardState = {
    dateRange: null,
    subjectDigestsWithPresences: null,
    lessonsWithAbsence: null,
    absencesGroupedByDay: null,
};

export const dashboardReducer = createReducer(
    initialState,
    on(
        dashboardActions.loadDashboardSuccess,
        (state, { type, ...dashboardData }) => ({
            ...state,
            ...dashboardData,
        })
    ),
    on(userDataActions.clearState, () => initialState)
);
