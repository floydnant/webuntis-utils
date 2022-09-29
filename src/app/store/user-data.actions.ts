import { createAction, props } from '@ngrx/store';
import { UserData } from '.';

export const userDataActions = {
    loadDataSuccess: createAction(
        '[ User Data ] load data success',
        props<{ userData: Omit<UserData, 'password'> }>()
    ),
    loginUser: createAction(
        '[ User Data ] login',
        props<{ userData: UserData }>()
    ),
    loginUserSuccess: createAction(
        '[ User Data ] login success',
        props<{ userData: UserData }>()
    ),
    // this doens't actually do anything yet, we could do this with a global error action though
    loginUserError: createAction(
        '[ User Data ] login error',
        props<{ message: string }>()
    ),

    clearState: createAction('[ User Data ] clear state'),
};
