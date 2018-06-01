import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {AppRoutesModule} from './app-routes.module';

import {AppComponent} from './app.component';
import {UserComponent} from './user/user.component';
import {ChatComponent} from './chat/chat.component';
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';
import {UserSearchComponent} from './user-search/user-search.component';

import {UserService} from './user.service';
import {ChatService} from './chat.service';

import {FilterPipe, SortByPipe} from './myPipes';

@NgModule({
    declarations: [
        AppComponent,
        UserComponent,
        ChatComponent,
        LoginComponent,
        RegisterComponent,
        UserSearchComponent,
        FilterPipe,
        SortByPipe
    ],
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutesModule
    ],
    providers: [
        UserService,
        ChatService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
