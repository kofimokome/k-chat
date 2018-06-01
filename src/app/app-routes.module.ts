import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';

// importing the components
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';
import {ChatComponent} from './chat/chat.component';
import {UserComponent} from './user/user.component';

// Setting the routes
const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'profile', component: UserComponent},
    {path: '', redirectTo: '/login', pathMatch: 'full'},
    {path: 'chat/:name', component: ChatComponent}
];
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forRoot(routes)
    ],
    exports: [RouterModule],
    declarations: []
})
export class AppRoutesModule {
}
