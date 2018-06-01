import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {UserService} from '../user.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    isError: boolean;
    error_message: string;

    constructor(private userService: UserService,
                private router: Router) {
        if (userService.isLogin()) {
            router.navigate(['/profile']);
        }
    }

    /* registers a new user to the system */
    register(username: string, password: string): void {
        this.userService.socket.on('register', (result) => { // <--- here
            localStorage.setItem('loggedIn', result);
            this.error_message = result.message;
            this.isError = true;
        });
        this.userService.socket.on('login', (result) => { // <--- here
            localStorage.setItem('loggedIn', result.success);
            if (result.success) {
                localStorage.setItem('id', result.user.id);
                localStorage.setItem('username', result.user.username);
                this.router.navigate(['/profile']);
            } else {
                this.error_message = result.message;
                this.isError = true;
            }
        });
        this.isError = false;
        this.userService.register(username, password);
    }

    ngOnInit() {
    }

}
