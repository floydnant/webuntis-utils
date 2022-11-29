import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AbsencesResponse } from 'netlify/functions/absences';
import { LessonsResponse } from 'netlify/functions/lessons';
import { PresenceResponse } from 'netlify/functions/presence';
import { AppState, UserDataState } from '../store';

@Injectable({
    providedIn: 'root',
})
export class WebuntisService {
    constructor(private store: Store<AppState>, private http: HttpClient) {
        this.store
            .select((state) => state.userData)
            .subscribe((useDataState) => {
                this.userData = useDataState;
            });
    }
    baseUrl = '/.netlify/functions';
    userData: UserDataState = null;

    getPresences() {
        return this.http.post<PresenceResponse>(
            this.baseUrl + '/presence',
            this.userData
        );
    }

    getAbsences() {
        return this.http.post<AbsencesResponse>(
            this.baseUrl + '/absences',
            this.userData
        );
    }

    getLessons() {
        return this.http.post<LessonsResponse>(
            this.baseUrl + '/lessons',
            this.userData
        );
    }

    testCredentials(userData: UserDataState) {
        return this.http.post<{ message: string }>(
            this.baseUrl + '/check-login',
            userData
        );
    }
}
