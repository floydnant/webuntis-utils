import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, delay, map, mergeMap } from 'rxjs/operators';
import { WebuntisService } from 'src/app/services/webuntis.service';
import {
    AppState,
    DashboardState,
    SessionStorageState,
    UserDataState,
} from '..';
import { dashboardActions } from '../dashboard.actions';

@Injectable()
export class DashboardEffects {
    constructor(
        private actions$: Actions,
        private untis: WebuntisService,
        private toast: HotToastService,
        private store: Store<AppState>,
        private router: Router
    ) {
        this.store.subscribe((state) => {
            this.dashboardState = state.dashboard;
            this.userData = state.userData;
        });
    }
    dashboardState!: DashboardState;
    userData?: UserDataState;

    loadSubjects = createEffect(() => {
        return this.actions$.pipe(
            ofType(dashboardActions.loadDashboard),
            mergeMap(({ ignoreCache }) => {
                if (!ignoreCache) {
                    try {
                        const sessionStorageState: SessionStorageState =
                            JSON.parse(
                                sessionStorage.getItem('dashboard-data')!
                            );

                        if (
                            sessionStorageState.username ==
                            this.userData?.username
                        )
                            return of(
                                dashboardActions.loadDashboardSuccess(
                                    sessionStorageState.dashboard
                                )
                            ).pipe(delay(0));
                    } catch {}
                }

                if (!this.userData?.password) {
                    this.toast.warning('Please login again');
                    this.router.navigateByUrl('/login');
                    return of(dashboardActions.loadDashboardError());
                }

                return this.untis.getPresences().pipe(
                    map((dashboardData) => {
                        const sessionStorageState: SessionStorageState = {
                            username: this.userData?.username!,
                            dashboard: dashboardData,
                        };
                        sessionStorage.setItem(
                            'dashboard-data',
                            JSON.stringify(sessionStorageState)
                        );
                        return dashboardActions.loadDashboardSuccess(
                            dashboardData
                        );
                    })
                );
            }),
            catchError(() => {
                this.toast.error('Failed to load data, please login again');
                this.router.navigateByUrl('/login');
                return of(dashboardActions.loadDashboardError());
            })
        );
    });
}
