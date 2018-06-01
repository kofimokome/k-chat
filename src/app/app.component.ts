import {Component} from '@angular/core';
import {UserService} from './user.service';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})


export class AppComponent {
    title = 'app';
    socket;

    constructor(private userService: UserService) {
        /*this.userService.socket.emit('test', 'I am a test');
        this.userService.socket.on('test', function (data) {
            console.log(data);
        });*/
    }
}
