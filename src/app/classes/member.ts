import {User} from './user';
/*
 * Defines a member belonging to a chat
 */
export class Member {
    chat_room_id: number;
    user_id: number;
    deleted: boolean;
    userDetails: User;

    constructor(chat_room_id: number, user_id: number) {
        this.chat_room_id = chat_room_id;
        this.user_id = user_id;
        this.deleted = false;
    }
}