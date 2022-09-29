import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, SubjectData, UserDataState } from '../store';

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
        return this.http.post<SubjectData[]>(
            this.baseUrl + '/presence',
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
