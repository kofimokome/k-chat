import {Component, OnInit} from '@angular/core';
import {Router}            from '@angular/router';


import {UserSearchService} from '../user-search.service';
import {UserService}       from '../user.service';
import {User}              from '../classes/user';
import {ChatService}       from '../chat.service';

@Component({
    selector: 'app-user-search',
    templateUrl: './user-search.component.html',
    styleUrls: ['./user-search.component.css'],
    providers: [UserSearchService]
})
export class UserSearchComponent implements OnInit {
    users: User[];

    constructor(private userSearchService: UserSearchService,
                private router: Router,
                private userService: UserService,
                private chatService: ChatService) {
    }

    // Push a search term into the observable stream.
    search(term: string): void {
        this.userService.socket.on('search', (result) => {
            this.users = result;
        });
        this.userSearchService.search(term);
    }

    newPrivateChat(user_id: number): void {
        this.chatService.newChat('p', user_id);
    }

    ngOnInit(): void {
    }
}
