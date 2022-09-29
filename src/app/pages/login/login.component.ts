import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, UserData, UserDataState } from 'src/app/store';
import { userDataActions } from 'src/app/store/user-data.actions';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    constructor(private store: Store<AppState>) {
        this.store
            .select((state) => state.userData)
            .subscribe((userData) => {
                this.userData = userData;
            });
    }

    // idealy this would sit in a database and update every time a user logges in with a value that is not yet stored
    autoComplete = {
        schools: ['OSZ KIM_Berlin'],
        servers: ['urania.webuntis.com'],
    };

    userData: UserDataState = null;

    onSubmit(userData: string | UserData) {
        if (typeof userData == 'string')
            this.store.dispatch(
                userDataActions.loginUser({
                    userData: { ...this.userData!, password: userData },
                })
            );
        else this.store.dispatch(userDataActions.loginUser({ userData }));
    }

    clearState() {
        this.store.dispatch(userDataActions.clearState());
    }
}
