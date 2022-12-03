import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { userDataActions } from '../user-data.actions';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { UserData } from '..';
import { appActions } from '../app.actions';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { WebuntisService } from 'src/app/services/webuntis.service';
import { EMPTY } from 'rxjs';

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
                    );
                    if (!userData) return appActions.nothing();
                    return userDataActions.loadDataSuccess({ userData });
                } catch {
                    return appActions.nothing();
                }
            })
        );
    });

    loginUser = createEffect(() =>
        this.actions$.pipe(
            ofType(userDataActions.loginUser),
            mergeMap(({ userData }) => {
                return this.webuntis.testCredentials(userData).pipe(
                    this.toast.observe({
                        loading: 'Checking credentials...',
                        success: (res) => res.message,
                        error: (res) =>
                            res.error.message ||
                            'Something went wrong, try again please.',
                    }),
                    map(() => userDataActions.loginUserSuccess({ userData })),
                    catchError(() => EMPTY)
                );
            })
        )
    );

    loginUserSuccess = createEffect(
        () =>
            this.actions$.pipe(
                ofType(userDataActions.loginUserSuccess),
                tap(({ userData: { password, ...userData } }) => {
                    // save data for next session
                    localStorage.setItem(
                        this.localStorageKey,
                        JSON.stringify(userData)
                    );

                    // redirect to dashboard
                    this.router.navigate(['dashboard']);
                })
            ),
        { dispatch: false }
    );
}
