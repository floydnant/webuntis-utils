import { createReducer, on } from '@ngrx/store';
import { UserDataState } from '.';
import { userDataActions } from './user-data.actions';

export const userDataReducer = createReducer<UserDataState>(
    null,
    on(userDataActions.loadDataSuccess, (_state, { userData }) => ({
        ...userData,
        password: null,
    })),
    on(userDataActions.loginUserSuccess, (_state, { userData }) => userData),
    on(userDataActions.clearState, () => null)
);
