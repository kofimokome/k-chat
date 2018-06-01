import {Member} from './member';
import {ChatRoom} from './chat_room';
import {Message} from './message';

export class Room {
    chat_room: ChatRoom;
    members: Member[];
    messages: Message[];
}