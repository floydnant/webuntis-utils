import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { PresenceResponse } from 'netlify/functions/presence';
import { of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { WebuntisService } from 'src/app/services/webuntis.service';
import { dashboardActions } from '../dashboard.actions';

@Injectable()
export class DashboardEffects {
    constructor(private actions$: Actions, private untis: WebuntisService) {}

    loadSubjects = createEffect(() => {
        return this.actions$.pipe(
            ofType(dashboardActions.loadSubjects),
            mergeMap(() => {
                const subjectsRaw = sessionStorage.getItem(
                    'untis-data-subjects'
                );
                if (subjectsRaw) {
                    const subjects = JSON.parse(
                        subjectsRaw
                    ) as PresenceResponse;
                    return of(
                        dashboardActions.loadSubjectsSuccess({
                            subjects: subjects.subjectDigestsWithPresences,
                        })
                    );
                }
                return this.untis.getPresences().pipe(
                    map((subjects) => {
                        sessionStorage.setItem(
                            'untis-data-subjects',
                            JSON.stringify(subjects)
                        );
                        return dashboardActions.loadSubjectsSuccess({
                            subjects: subjects.subjectDigestsWithPresences,
                        });
                    })
                );
            })
        );
    });
}
