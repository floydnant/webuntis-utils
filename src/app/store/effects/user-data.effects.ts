import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { userDataActions } from '../user-data.actions';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { UserData } from '..';
import { appActions } from '../app.actions';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { WebuntisService } from 'src/app/services/webuntis.service';
import { of } from 'rxjs';

@Injectable()
export class UserDataEffects {
    constructor(
        private actions$: Actions,
        private router: Router,
        private webuntis: WebuntisService,
        private toast: HotToastService
    ) {}

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

    loginUser = createEffect(() =>
        this.actions$.pipe(
            ofType(userDataActions.loginUser),
            mergeMap(({ userData }) => {
                return this.webuntis.testCredentials(userData).pipe(
                    this.toast.observe({
                        loading: '',
                        success: (res) => res.message,
                        error: (res) => res.error.message,
                    }),
                    map(() => userDataActions.loginUserSuccess({ userData })),
                    catchError((err) => {
                        return of(
                            userDataActions.loginUserError({
                                message: err.error.message,
                            })
                        );
                    })
                );
            })
        )
    );

    redirectOnLogin = createEffect(
        () =>
            this.actions$.pipe(
                ofType(userDataActions.loginUserSuccess),
                tap(() => this.router.navigate(['dashboard']))
            ),
        { dispatch: false }
    );
}
