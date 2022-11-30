import { Component, OnInit } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { dashboardActions } from 'src/app/store/dashboard.actions';
import { moveToMacroQueue } from 'src/app/utils';
import { getLoadingUpdates } from 'src/app/utils/store-helpers';

@Component({
    selector: 'app-subjects',
    templateUrl: './subjects.component.html',
    styleUrls: ['./subjects.component.scss'],
})
export class SubjectsComponent implements OnInit {
    constructor(private store: Store<AppState>, private actions$: Actions) {}
    ngOnInit(): void {
        moveToMacroQueue(() => {
            this.store.dispatch(dashboardActions.loadSubjects());
        });
    }

    subjects$ = this.store.select((state) => state.dashboard.subjects);
    isLoading$ = getLoadingUpdates(this.actions$, [
        dashboardActions.loadSubjects,
        dashboardActions.loadSubjectsSuccess,
        dashboardActions.loadSubjectsError,
    ]);
}
