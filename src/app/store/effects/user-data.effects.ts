import { Injectable } from '@angular/core';
import { Actions, createEffect, mergeEffects, ofType } from '@ngrx/effects';
import { userDataActions } from '../user-data.actions';
import { map, mergeMap, tap } from 'rxjs/operators';
import { UserData } from '..';
import { appActions } from '../app.actions';
import { Router } from '@angular/router';

@Injectable()
export class UserDataEffects {
    constructor(private actions$: Actions, private router: Router) {}

    readonly localStorageKey = 'user-data';

    loadUserData = createEffect(() => {
        return this.actions$.pipe(
            ofType('@ngrx/effects/init'),
            map(() => {
                try {
                    const userData = JSON.parse(
                        localStorage.getItem(this.localStorageKey)!
                    ) as UserData;
                    if (!userData) return appActions.nothing();
                    return userDataActions.loadDataSuccess({ userData });
                } catch {
                    return appActions.nothing();
                }
            })
        );
    });
    saveUserData = createEffect(
        () =>
            this.actions$.pipe(
                ofType(userDataActions.loginUser),
                tap(({ userData }) => {
                    localStorage.setItem(
                        this.localStorageKey,
                        JSON.stringify(userData)
                    );
                })
            ),
        { dispatch: false }
    );

    redirectOnLogin = createEffect(
        () =>
            this.actions$.pipe(
                ofType(userDataActions.loginUser),
                tap(() => this.router.navigate(['dashboard']))
            ),
        { dispatch: false }
    );
}
