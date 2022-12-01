import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AbsencesComponent } from './pages/dashboard/absences/absences.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SubjectsComponent } from './pages/dashboard/subjects/subjects.component';
import { LoginComponent } from './pages/login/login.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: 'dashboard',
        component: DashboardComponent,
        children: [
            { path: 'subjects', component: SubjectsComponent },
            { path: 'absences', component: AbsencesComponent },
            { path: '', redirectTo: 'subjects', pathMatch: 'full' },
        ],
    },
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    { path: '**', redirectTo: '' }, // @TODO: #5 add 404 page
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
