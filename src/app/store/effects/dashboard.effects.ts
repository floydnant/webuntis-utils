import { Injectable } from '@angular/core';
import { HotToastService } from '@ngneat/hot-toast';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { PresenceResponse } from 'netlify/functions/presence';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { WebuntisService } from 'src/app/services/webuntis.service';
import { dashboardActions } from '../dashboard.actions';

@Injectable()
export class DashboardEffects {
    constructor(
        private actions$: Actions,
        private untis: WebuntisService,
        private toast: HotToastService
    ) {}

    loadSubjects = createEffect(() => {
        return this.actions$.pipe(
            ofType(dashboardActions.loadDashboard),
            mergeMap(() => {
                const dashboardDataRaw =
                    sessionStorage.getItem('dashboard-data');
                if (dashboardDataRaw) {
                    const dashboardData = JSON.parse(
                        dashboardDataRaw
                    ) as PresenceResponse;
                    return of(
                        dashboardActions.loadDashboardSuccess(dashboardData)
                    );
                }
                return this.untis.getPresences().pipe(
                    map((dashboardData) => {
                        sessionStorage.setItem(
                            'dashboard-data',
                            JSON.stringify(dashboardData)
                        );
                        return dashboardActions.loadDashboardSuccess(
                            dashboardData
                        );
                    })
                );
            }),
            catchError(() => {
                this.toast.error('Failed to load subjects');
                return of(dashboardActions.loadDashboardError());
            })
        );
    });
}
