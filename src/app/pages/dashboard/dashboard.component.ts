import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { dashboardActions } from 'src/app/store/dashboard.actions';
import { userDataActions } from 'src/app/store/user-data.actions';
import { moveToMacroQueue } from 'src/app/utils';
import { getLoadingUpdates } from 'src/app/utils/store-helpers';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
    constructor(
        private store: Store<AppState>,
        private router: Router,
        private actions$: Actions
    ) {}

    ngOnInit(): void {
        moveToMacroQueue(() => {
            this.store.dispatch(dashboardActions.loadDashboard());
        });
    }

    isLoading$ = getLoadingUpdates(this.actions$, [
        dashboardActions.loadDashboard,
        dashboardActions.loadDashboardSuccess,
        dashboardActions.loadDashboardError,
    ]);

    dateRange$ = this.store.select((state) => state.dashboard.dateRange);

    username$ = this.store.select((state) => state.userData?.username);

    clearState() {
        this.router.navigate(['/login']);
        this.store.dispatch(userDataActions.clearState());
    }
}
