import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import * as io from 'socket.io-client';
import 'rxjs/add/operator/toPromise';
@Injectable()
// User service for my app
export class UserService {
    socket: io;

    constructor(private router: Router) {
        this.socket = io('http://localhost:8890');
        if (this.isLogin()) {
            this.socket.emit('update_me', this.userId());
        } else {
            this.router.navigate(['/login']);
        }
    }

    getSocket(): void {
        return this.socket;
    }

    register(username: string, password: string): void {
        const data = {
            username: username,
            password: password
        };
        this.socket.emit('register', data);

    }

    login(username: string, password: string): void {
        const data = {
            username: username,
            password: password
        };
        this.socket.emit('login', data);
    }

    isLogin(): boolean {
        return localStorage.getItem('loggedIn') === 'true' ? true : false;
    }

    logout(): void {
        localStorage.setItem('loggedIn', 'false');
        localStorage.removeItem('id');
        localStorage.removeItem('username');
        this.socket.emit('logout');
        this.router.navigate(['/login']);
    }

    // Returns the user's id
    userId(): string {
        return localStorage.getItem('id');
    }

    getInt(value: string): number {
        return parseInt(value);
    }
}
