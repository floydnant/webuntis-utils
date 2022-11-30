import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { dashboardActions } from 'src/app/store/dashboard.actions';
import { userDataActions } from 'src/app/store/user-data.actions';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
    constructor(private store: Store<AppState>, private router: Router) {}

    ngOnInit(): void {
        this.store.dispatch(dashboardActions.loadSubjects());
    }

    username$ = this.store.select((state) => state.userData?.username);

    clearState() {
        this.router.navigate(['/login']);
        this.store.dispatch(userDataActions.clearState());
    }
}
