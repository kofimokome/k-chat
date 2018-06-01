import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import {UserService}  from './user.service';
import {Room} from './classes/room';
import {Member} from './classes/member';
import {Message} from './classes/message';

@Injectable()
export class ChatService {
    chat_rooms: Room[];

    constructor(private userService: UserService,
                private router: Router) {
        this.userService.socket.on('update_me', (data) => {
            this.chat_rooms = data;
        });
        this.userService.socket.on('newPrivateChat', (data) => {
            this.chat_rooms.push(data);
            if (data.chat_room.creator === this.userService.getInt(this.userService.userId())) {
                window.location.href = '/chat/' + data.chat_room.name2;
            }
            // this.router.navigate(['/chat', data.chat_room.name]);
        });
        this.userService.socket.on('newGroupChat', (data) => {
            this.chat_rooms.push(data);
        });
        this.userService.socket.on('addMember', (data) => {
            this.chat_rooms.push(data);
        });
        this.userService.socket.on('removeMember', (data) => {
            for (let i = 0; i < this.chat_rooms.length; i++) {
                if (this.chat_rooms[i].chat_room.id == data) {
                    this.chat_rooms[i].chat_room.deleted = true;
                }
            }
        });
        this.userService.socket.on('newMessage', (data) => {
            for (let i = 0; i < this.chat_rooms.length; i++) {
                if (this.chat_rooms[i].chat_room.id === data.chat_room_id) {
                    this.chat_rooms[i].messages.push(data);
                }
            }
        });
        this.userService.socket.on('offline', (id) => {
            for (let i = 0; i < this.chat_rooms.length; i++) {
                for (let k = 0; k < this.chat_rooms[i].members.length; k++) {
                    if (this.chat_rooms[i].members[k].user_id == id) {
                        this.chat_rooms[i].members[k].userDetails.online = false;
                    }
                }
            }
        });
        this.userService.socket.on('online', (id) => {
            for (let i = 0; i < this.chat_rooms.length; i++) {
                for (let k = 0; k < this.chat_rooms[i].members.length; k++) {
                    if (this.chat_rooms[i].members[k].user_id == id) {
                        this.chat_rooms[i].members[k].userDetails.online = true;
                    }
                }
            }
        });
    }

    setChatRooms(chat_rooms: Room[]): void {
        this.chat_rooms = chat_rooms;
    }

    getChatRooms(): Room[] {
        return this.chat_rooms;
    }

    getChat(name: string): any {
        for (let i = 0; i < this.chat_rooms.length; i++) {
            if (this.chat_rooms[i].chat_room.name === name || this.chat_rooms[i].chat_room.name2 === name) {
                return this.chat_rooms[i];
            }
        }

        return false;

    }

    newChat(name: string, id: number): void {
        if (name === 'p') {
            this.userService.socket.emit('newPrivateChat', id);
        } else {
            this.userService.socket.emit('newGroupChat', name);
        }
    }

    newMessage(user: number, room: number, message: string): void {
        if (message !== '') {
            const newMessage = new Message(room, user, message);
            for (let i = 0; i < this.chat_rooms.length; i++) {
                if (this.chat_rooms[i].chat_room.id === room) {
                    this.chat_rooms[i].messages.push(newMessage);
                }
            }
            this.userService.socket.emit('newMessage', room, message);
        }
    }

    removeChat(id: number): void {
        this.userService.socket.on('removeChat', (data) => {
            for (let i = 0; i < this.chat_rooms.length; i++) {
                if (this.chat_rooms[i].chat_room.id == data) {
                    this.chat_rooms[i].chat_room.deleted = true;
                }
            }
        });
        this.userService.socket.emit('removeChat', id);
    }

    addMember(room: number, user: number): void {
        const member = new Member(room, user);
        for (let i = 0; i < this.chat_rooms.length; i++) {
            if (this.chat_rooms[i].chat_room.id == room) {
                this.chat_rooms[i].members.push(member);
            }
        }
        this.userService.socket.emit('addMember', room, user);
    }

    removeMember(room: number, user: number): void {
        for (let i = 0; i < this.chat_rooms.length; i++) {
            if (this.chat_rooms[i].chat_room.id == room) {
                for (let j = 0; j < this.chat_rooms[i].members.length; j++) {
                    if (this.chat_rooms[i].members[j].user_id == user) {
                        this.chat_rooms[i].members[j].deleted = true;
                    }
                }
            }
        }
        this.userService.socket.emit('removeMember', room, user);
    }
}
