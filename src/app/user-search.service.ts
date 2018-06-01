import {Injectable} from '@angular/core';
import {UserService} from './user.service';


@Injectable()
export class UserSearchService {

    constructor(private userService: UserService) {
    }

    search(term: string): void {
        this.userService.socket.emit('search', term);
    }
}
