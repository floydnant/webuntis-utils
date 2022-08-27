import { createReducer, on } from '@ngrx/store';
import { DashboardState } from '.';
import { dashboardActions } from './dashboard.actions';
import { userDataActions } from './user-data.actions';

const initialState: DashboardState = {
    subjects: null,
};

export const dashboardReducer = createReducer(
    initialState,
    on(dashboardActions.loadSubjectsSuccess, (state, { subjects }) => ({
        ...state,
        subjects,
    })),
    on(userDataActions.clearState, () => initialState)
);
