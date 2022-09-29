import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './store';
import { EffectsModule } from '@ngrx/effects';
import { effects } from './store/effects';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HotToastModule } from '@ngneat/hot-toast';

@NgModule({
    declarations: [AppComponent, LoginComponent, DashboardComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        StoreModule.forRoot(reducers, {
            metaReducers,
        }),
        EffectsModule.forRoot(effects),
        HotToastModule.forRoot(),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
