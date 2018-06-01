/*
 * Chat messages object
 */
export class Message {
    user_id: number;
    chat_room_id: number;
    message: string;
    deleted: boolean;
    constructor(room_id: number, user_id: number, message: string) {
        this.user_id = user_id;
        this.chat_room_id = room_id;
        this.message = message;
        this.deleted = false;
    };
}