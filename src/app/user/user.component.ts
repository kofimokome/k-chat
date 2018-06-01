import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {UserService} from '../user.service';
import {ChatService} from '../chat.service';
import {Room} from '../classes/room';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
    chat_rooms: Room[];
    user_id: number;


    constructor(private router: Router,
                private userService: UserService,
                private chatService: ChatService) {
        if (!this.userService.isLogin()
        ) {
            this.router.navigate(['/login']);
        } else {
            this.chat_rooms = this.chatService.getChatRooms();
            this.userService.socket.on('update_me', (data) => {
                this.chat_rooms = data;
            });
            this.user_id = this.userService.getInt(this.userService.userId());
        }
    }

    logout(): void {
        this.userService.logout();
    }

    ngOnInit() {

    }

}
