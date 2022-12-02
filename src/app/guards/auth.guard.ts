import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppState, SessionStorageState } from '../store';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(private store: Store<AppState>, private router: Router) {}

    canActivate():
        | Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree>
        | boolean
        | UrlTree {
        return this.store.pipe(
            map((state) => {
                if (!state.userData?.password) {
                    const loginRoute = this.router.parseUrl('/login');
                    try {
                        const data: SessionStorageState = JSON.parse(
                            sessionStorage.getItem('dashboard-data')!
                        );

                        if (!data || data.username != state.userData?.username)
                            return loginRoute;
                    } catch {
                        return loginRoute;
                    }
                }
                return true;
            })
        );
    }
}
