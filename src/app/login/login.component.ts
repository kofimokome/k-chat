import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {UserService} from '../user.service';
import {ChatService} from '../chat.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    isError: boolean;
    error_message: string;

    constructor(private userService: UserService,
                private router: Router,
                private chatService: ChatService) {
    }

    // this.router.navigate(['/detail', this.selectedHero.id])

    login(username: string, password: string): void {

        this.userService.socket.on('login', (result) => { // <--- here
            localStorage.setItem('loggedIn', result.success);
            if (result.success) {
                localStorage.setItem('id', result.user.id);
                localStorage.setItem('username', result.user.username);
                this.chatService.setChatRooms(result.chat_rooms);
                console.log('chat_rooms: ' + result.chat_rooms);
                window.location.href = '/profile';
                // this.router.navigate(['/profile']);
            } else {
                this.error_message = result.message;
                this.isError = true;
            }
        });
        this.isError = false;
        this.userService.login(username, password);
    }


    ngOnInit() {
        if (this.userService.isLogin()) {
            this.router.navigate(['/profile']);
        }
    }


}
