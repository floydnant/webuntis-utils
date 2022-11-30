import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';

@Component({
    selector: 'app-absences',
    templateUrl: './absences.component.html',
    styleUrls: ['./absences.component.scss'],
})
export class AbsencesComponent {
    constructor(private store: Store<AppState>) {}

    groupedAbsences$ = this.store.select(
        (state) => state.dashboard.absencesGroupedByDay
    );
}
