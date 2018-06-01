import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';

import {ChatService} from '../chat.service';
import {Member} from '../classes/member';
import {UserService} from '../user.service';
import {Message} from '../classes/message';
import {ChatRoom} from '../classes/chat_room';
import {User} from '../classes/user';
import {Room} from '../classes/room';
import 'rxjs/add/operator/switchMap';
import * as $ from 'jquery';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
    termd: string;
    room_name;
    chat_room: Room;
    members: Member[];
    user_id: number;
    typing: string;


    constructor(private route: ActivatedRoute,
                private chatService: ChatService,
                private userService: UserService) {
    }

    newMessage(message: string, keyCode: number): void {
        if (keyCode === 13) {
            this.chatService.newMessage(this.userService.getInt(this.userService.userId()), this.chat_room.chat_room.id, message);
        }
    }

    isTyping(room_id: number): void {
        this.userService.socket.emit('typing', room_id);
    }

    ngOnInit() {
        this.route.params.subscribe((params: ParamMap) => {
            this.room_name = params['name'];
        });
        this.user_id = this.userService.getInt(this.userService.userId());
        this.userService.socket.on('typing', (username) => {
            this.typing = username + ' is typing';
        });
        setInterval(() => {
            this.typing = '';
        }, 2000);
        // TODO: try to avoid the errors that keep coming in the console
        // TODO: why is user 9 always in all groups?
        // TODO: see how to fix [Object object] when a user sends a message
        this.userService.socket.on('update_me', () => {
            this.chat_room = this.chatService.getChat(this.room_name);
        });
        this.chat_room = this.chatService.getChat(this.room_name);

        // this.members = this.chat_room.members;

        this.userService.socket.on('newMessage', () => {
            /*setTimeout(() => {
             this.chat_room = this.chatService.getChat(this.room_name);
             }, 3000);*!/
             console.log('new message: ' + this.chat_room.messages);*/
            $('#messages').stop().animate({
                scrollTop: $('#messages')[0].scrollHeight
            }, 1000);

        });
    }
}
