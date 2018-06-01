/*
 *  My angular chat app
 *  @version: 1
 *  @author: Kofi Mokome
 */

/* Initialising The Server */
var express = require('express');
const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
//var redis = require('redis');
//const history = require('connect-history-api-fallback')
//const staticMiddleWare = express.static('dist')

//app.use(staticMiddleWare)
//app.use(history())
//app.use(staticMiddleWare)
//app.use(express.static('dist'))

server.listen(process.env.PORT || 8890, function () {
    console.log('listening on', server.address().port);
});

/* Setting up server variables */
// Assigns a new user a unique id
var user_id = 1;
// Assigns a new chat room a unique id
var chat_room_id = 1;
// Stores all registered users
var users = [];
// Stores all chat rooms
var chat_rooms = [];
// Stores all chat room members
var chat_room_members = [];
// Stores all chat messages
var chat_messages = [];
// Stores the credentials for our administrator
var admin = new User('admin', 'admin');
users.push(admin);
for (let i = user_id; i < 10; i++) {
    users.push(new User('user' + i, 'secret'));
    chat_rooms.push(new ChatRoom('chat' + i, 'chat' + i, true, i));
    chat_room_members.push(new ChatRoomMember(i, i));
}

/* Setting up server functions */
// Creates a new user object
function User(name, password, server_id) {
    this.username = name;
    this.id = user_id;
    this.password = password;
    this.server_id = server_id;
    this.online = false;
    user_id++;
}
// Creates a new chat room object
function ChatRoom(name, name2, isPrivate, creator) {
    this.id = chat_room_id;
    this.name = name;
    this.name2 = name2;
    this.isPrivate = isPrivate;
    this.deleted = false;
    this.creator = creator;
    chat_room_id++;
}
// Creates a new chat room member
function ChatRoomMember(room_id, user_id) {
    this.chat_room_id = room_id;
    this.user_id = user_id;
    this.deleted = false;
}
// Creates a new chat message
function ChatMessage(room_id, user_id, message) {
    this.user_id = user_id;
    this.chat_room_id = room_id;
    this.message = message;
    this.deleted = false;
}
// Searches for a given user
function findUser(id) {
    for (let i = 1; i < users.length; i++) {
        if (users[i].id == id) {
            return i;
        }
    }
    return false;
}
//
function getUserDetails(id) {
    var user = {
        username: users[id].username,
        id: users[id].id,
        online: users[id].online
    };
    return user;
}
// Searches for a given user from his/her server id
function findSocketUser(socket_id) {
    for (let i = 1; i < users.length; i++) {
        if (users[i].server_id === socket_id) {
            return i;
        }
    }
    return false;
}
// Searches for a given chat room
function findChatRoom(id) {
    for (let i = 1; i < chat_rooms.length; i++) {
        if (chat_rooms[i].id == id && !chat_rooms[i].deleted) {
            return i;
        }
    }
    return false;
}
// Gets all members for a given chat room
function getChatRoomMembers(id) {
    let members = [];
    for (let i = 0; i < chat_room_members.length; i++) {
        if (chat_room_members[i].chat_room_id == id && !chat_room_members[i].deleted) {
            let temp = chat_room_members[i];
            temp.userDetails = getUserDetails(findUser(chat_room_members[i].user_id));
            members.push(temp);
        }
    }
    return members;
}
// Gets all messages for a given chat room
function getChatRoomMessages(id) {
    let messages = [];
    for (let i = 0; i < chat_messages.length; i++) {
        if (chat_messages[i].chat_room_id == id && !chat_messages[i].deleted) {
            messages.push(chat_messages[i]);
        }
    }
    return messages;
}
// Logs Data to the admin panel and to the console
function logData(message) {
    let d = new Date();
    let time = '[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] ';
    console.log(time + message);
    let logs = {
        log: time + message
    };
    io.emit('admin', logs);
}

// Tries to login a user
function attemptLogin(data, socket_id, socket) {
    let username = data.username;
    let password = data.password;
    var found = false;
    var result = {
        success: false,
        message: '',
        user: '',
        chat_rooms: {}
    };
    for (let i = 0; i < users.length; i++) {
        if (users[i].username === username) {
            found = true;
            if (users[i].password === password) {
                users[i].online = true;
                result.user = getUserDetails(i);
                result.success = true;
                result.message = "You Are Now Logged In";
                for (let j = 0; j < chat_room_members.length; j++) {
                    if (chat_room_members[i].user_id === users[i].id && !chat_room_members[i].deleted) {
                        let chat_room = findChatRoom(chat_room_members[i].chat_room_id);
                        let members = getChatRoomMembers(chat_room_members[i].chat_room_id);
                        let messages = getChatRoomMessages(chat_room_members[i].chat_room_id);

                        let chat_room_details = {
                            chat_room: chat_rooms[chat_room],
                            members: members,
                            messages: messages
                        };
                        result.chat_rooms.push(chat_room_details);
                        socket.join("chat" + chat_rooms[chat_room].id);
                    }
                }
                online(users[i].id, socket);
                logData(users[i].username + ' has logged in');
                io.to(socket_id).emit('login', result);
            } else {
                result.message = "Password Is Incorrect";
                io.to(socket_id).emit('login', result);
            }
        }
    }
    if (!found) {
        result.message = 'User Not Found';
        io.to(socket_id).emit('login', result);
    }
}

function online(id, socket) {
    for (let i = 0; i < chat_room_members.length; i++) {
        if (chat_room_members[i].user_id === id) {
            let chat_room = findChatRoom(chat_room_members[i].chat_room_id);
            socket.broadcast.to("chat" + chat_rooms[chat_room].id).emit('online', id);
        }
    }
}

function offline(id, socket) {
    for (let i = 0; i < chat_room_members.length; i++) {
        if (chat_room_members[i].user_id === id) {
            let chat_room = findChatRoom(chat_room_members[i].chat_room_id);
            socket.broadcast.to("chat" + chat_rooms[chat_room].id).emit('offline', id);
        }
    }
}


/* Events to listen to and emit */
io.on('connection', function (socket) {
    logData("New Client Connected: " + socket.id);

    /* User Related Functions */
    // Emitted when a logged in user refreshes a page
    socket.on('update_me', function (user_id) {
        let user = findUser(user_id);
        if (user) {
            let result = [];
            users[user].server_id = socket.id;
            users[user].online = true;
            online(users[user].id, socket);
            for (let i = 0; i < chat_room_members.length; i++) {
                if (chat_room_members[i].user_id === users[user].id && !chat_room_members[i].deleted) {
                    let chat_room = findChatRoom(chat_room_members[i].chat_room_id);
                    if (chat_room) {
                        let members = getChatRoomMembers(chat_room_members[i].chat_room_id);
                        let messages = getChatRoomMessages(chat_room_members[i].chat_room_id);

                        let chat_room_details = {
                            chat_room: chat_rooms[chat_room],
                            members: members,
                            messages: messages
                        };
                        result.push(chat_room_details);
                        socket.join("chat" + chat_rooms[chat_room].id);
                    }
                }
            }
            // logData(users[user].username + " has been updated");
            io.to(socket.id).emit('update_me', result);
        }
    });

    /* Auth Related Functions */
    socket.on('login', function (data) {
        attemptLogin(data, socket.id, socket);
    });
    socket.on('register', function (data) {
        let username = data.username;
        let password = data.password;
        var found = false;
        var result = {
            success: false,
            message: ''
        };
        for (let i = 0; i < users.length; i++) {
            if (users[i].username === username) {
                found = true;
            }
        }
        if (!found) {
            if (username === '') {
                result.message = 'Please enter a username';
                io.to(socket.id).emit('register', result);
            } else if (username.length < 4) {
                result.message = 'Please enter a username with more than 4 characters';
                io.to(socket.id).emit('register', result);
            } else if (password === '') {
                result.message = 'Please enter a password';
                io.to(socket.id).emit('register', result);
            } else if (password.length < 4) {
                result.message = 'Please enter a password with more than 4 characters';
                io.to(socket.id).emit('register', result);
            } else {
                let newUser = new User(username, password, socket.id);
                users.push(newUser);
                logData(username + ' has created an account');
                attemptLogin(data, socket.id, socket);
            }
        } else {
            result.message = "User name already taken";
            io.to(socket.id).emit('register', result);
        }
    });

    /* Chat Related functions */
    socket.on('newPrivateChat', function (user_id) {
        /*
         You can call join to subscribe the socket to a given channel:

         io.on('connection', function(socket){
         socket.join('some room');
         });
         And then simply use to or in (they are the same) when broadcasting or emitting:

         io.to('some room').emit('some event');
         To leave a channel you call leave in the same fashion as join.
         */
        let me = findSocketUser(socket.id);
        let user = findUser(user_id);
        if (user && me) {
            var proceed = true;
            for (let i = 0; i < chat_rooms.length; i++) {
                if ((chat_rooms[i].name === users[me].username && chat_rooms[i].name2 === users[user].username) || (chat_rooms[i].name === users[user].username && chat_rooms[i].name2 === users[me].username)) {
                    proceed = false;
                }
            }
            if (proceed) {
                let chat_room = new ChatRoom(users[me].username, users[user].username, true, users[me].id);
                chat_rooms.push(chat_room);
                socket.join("chat" + chat_room.id);

                // TODO: why is user 9 always in all groups?
                let member = new ChatRoomMember(chat_room.id, users[user].id);
                let creator = new ChatRoomMember(chat_room.id, users[me].id);
                chat_room_members.push(member, creator);

                let members = [];
                members.push(member, creator);
                let data = {
                    chat_room: chat_room,
                    members: members,
                    messages: []
                };
                logData('New Chat room created: ' + chat_room.name + " and " + chat_room.name2);
                io.to(socket.id).emit('newPrivateChat', data);
                io.to(users[user].server_id).emit('newPrivateChat', data);
            }
        }
    });
    socket.on('newGroupChat', function (name) {
        let user = findSocketUser(socket.id);
        if (user) {
            let chat_room = new ChatRoom(name, name, false, users[user].id);
            chat_rooms.push(chat_room);
            socket.join("chat" + chat_room.id);

            let creator = new ChatRoomMember(chat_room.id, users[user].id);
            chat_room_members.push(creator);

            let data = {
                chat_room: chat_room,
                members: creator,
                messages: []
            };
            logData('New Chat room created: ' + chat_room.name);
            io.to(socket.id).emit('newGroupChat', data);
        }
    });
    socket.on('addMember', function (room_id, user_id) {
        let user = findUser(user_id);
        let room = findChatRoom(room_id);

        if (user && room) {
            let member = new ChatRoomMember(room_id, user_id);
            chat_room_members.push(member);
            socket.join("chat" + chat_rooms[room].id);

            let data = {
                chat_room: chat_rooms[room],
                members: getChatRoomMembers(room_id),
                messages: getChatRoomMessages(room_id)
            };
            logData('New Member Added To ' + chat_rooms[room].name);
            io.to(users[user].server_id).emit('addMember', data);
        }
    });
    socket.on('newMessage', function (room_id, newMessage) {
        let user = findSocketUser(socket.id);
        let room = findChatRoom(room_id);
        if (user && room) {
            let deleted = false;
            for (let i = 0; i < chat_room_members.length; i++) {
                if (chat_room_members[i].chat_room_id == room_id && chat_room_members[i].user_id === users[user].id && chat_room_members[i].deleted) {
                    deleted = true;
                }
            }
            if (!deleted && newMessage !== '') {
                let message = new ChatMessage(room_id, users[user].id, newMessage);
                chat_messages.push(message);

                // TODO: See if broadcast works in this case
                //io.to(chat_rooms[room].name).emit('newMessage', data);
                socket.broadcast.to("chat" + chat_rooms[room].id).emit('newMessage', message);
            }
        }
    });
    socket.on('removeMember', function (room_id, user_id) {
        let user = findUser(user_id);
        let room = findChatRoom(room_id);

        if (user && room) {
            for (let i = 0; i < chat_room_members.length; i++) {
                if (chat_room_members[i].chat_room_id == room_id && chat_room_members[i].user_id == user_id) {
                    chat_room_members[i].deleted = true;
                    for (let i = 0; i < chat_messages.length; i++) {
                        if (chat_messages[i].chat_room_id == room_id && chat_messages[i].user_id == user_id) {
                            chat_messages[i].deleted = true;
                        }
                    }
                    socket.leave("chat" + chat_rooms[room].id);
                    logData('Member Removed From ' + chat_rooms[room].name);
                    io.to(users[user].server_id).emit('removeMember', room_id);
                }
            }
        }
    });
    socket.on('removeChat', function (room_id) {
        let room = findChatRoom(room_id);

        if (room) {
            for (let i = 0; i < chat_rooms.length; i++) {
                if (chat_rooms[i].id == room_id) {
                    chat_rooms[i].deleted = true;
                    for (let i = 0; i < chat_room_members.length; i++) {
                        if (chat_room_members[i].chat_room_id == room_id) {
                            chat_room_members[i].deleted = true;
                            for (let i = 0; i < chat_messages.length; i++) {
                                if (chat_messages[i].chat_room_id == room_id) {
                                    chat_messages[i].deleted = true;
                                }
                            }

                            let user = findUser(chat_room_members[i].user_id);
                            if (user) {
                                socket.leave("chat" + chat_rooms[i].id);
                                io.to(users[user].server_id).emit('removeMember', room_id);
                            }
                        }
                    }
                }
            }
            logData('Chat Room: ' + chat_rooms[room].name + ' deleted');
            // TODO: this may not be needed in future
            io.to(socket.id).emit('removeChat', chat_rooms[room].id);
        }
    });
    socket.on('search', function (username) {
        // TODO: Remove or replace '/' or any other thing that will make the regex crash the server
        let pattern = new RegExp(username);
        let result = [];
        let user = findSocketUser(socket.id);
        if (user) {
            if (username !== '') {
                for (let i = 0; i < users.length; i++) {
                    if ((users[i].username).match(pattern) && users[i].username !== users[user].username && users[i].id !== 1) {
                        result.push(getUserDetails(i));
                    }
                }
            }
            if (result.length === 0) {
                let nothing = {
                    username: "no result found",
                    id: 0,
                    online: false
                };
                result.push(nothing);
            }

            io.to(socket.id).emit('search', result);
        }
    });
    socket.on('typing', function (room_id) {
        let room = findChatRoom(room_id);
        let user = findSocketUser(socket.id);
        if (room && user) {
            socket.broadcast.to("chat" + chat_rooms[room].id).emit('typing', users[user].username);
        }
    });
    socket.on('online', function () {
        let user = findSocketUser(socket.id);
        users[user].online = true;
        online(users[user].id, socket);
    });
    socket.on('logout', function () {
        let user = findSocketUser(socket.id);
        if (user) {
            users[user].online = false;
            // users[user].server_id = ''; // <- TODO: is this necessary?
            offline(users[user].id, socket);
            logData(users[user].username + ' has logged out');
        }
    });

    /* Emitted when a user leaves the server */
    socket.on('disconnect', function () {
        let user = findSocketUser(socket.id);
        if (user) {
            users[user].online = false;
            offline(users[user].id, socket);
        }
        logData("Client Disconnected: " + socket.id);
    });
});
