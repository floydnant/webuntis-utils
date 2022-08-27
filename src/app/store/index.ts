import {
    ActionReducer,
    ActionReducerMap,
    createFeatureSelector,
    createSelector,
    MetaReducer,
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import { userDataReducer } from './user-data.reducer';

export interface UserData {
    username: string;
    password: string | null;
    school: string;
    serverUrl: string;
}
export interface SubjectData {
    subjectId: string;
    presence: number;
    lessonsTotal: number;
    lessonsCancelled: number;
    lessonsMissed: number;
}

export type UserDataState = UserData | null;

export interface AppState {
    userData: UserDataState;
}

export const reducers: ActionReducerMap<AppState> = {
    userData: userDataReducer,
};

const debug = (reducer: ActionReducer<AppState>): ActionReducer<AppState> => {
    return (state, action) => {
        console.log('action', action);
        return reducer(state, action);
    };
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
    ? [debug]
    : [];
