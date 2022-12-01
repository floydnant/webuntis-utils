import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';

@Component({
    selector: 'app-subjects',
    templateUrl: './subjects.component.html',
    styleUrls: ['./subjects.component.scss'],
})
export class SubjectsComponent {
    constructor(private store: Store<AppState>) {}

    subjects$ = this.store.select(
        (state) => state.dashboard.subjectDigestsWithPresences
    );
}
