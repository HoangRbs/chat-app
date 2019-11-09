const express = require('express');
const path = require('path');
const Filter = require('bad-words');
const {generateMessages} = require('./utils/messages');
const queryString = require('querystring');
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom} = require('./utils/users');

const app = express();
const server = require('http').createServer(app); //pass app into http server
const io = require('socket.io')(server); //pass http server into socket

const publicDirPath = path.join(__dirname,'../public');

app.use(express.static(publicDirPath));

//the socket center
io.on('connection',(socket) =>{

    socket.on('userJoin',(userJoinInfo,errUserCallback) => {
        let {username, room} = queryString.parse(userJoinInfo.replace(/\?/,''));

        let { newUser,error } = addUser({ 
            id: socket.id,
            userName: username,
            room: room
        });

        if(error){
            errUserCallback(error);
            return;
        }

        socket.join(newUser.room);

        socket.emit('message',generateMessages('Welcome!','Admin'));
        socket.broadcast.to(newUser.room).emit('message',generateMessages(`${newUser.userName} has joined the room`,'Admin'));
        io.to(newUser.room).emit('roomData',{
            room: newUser.room,
            usersList: getUsersInRoom(newUser.room)
        });
    })

    socket.on('userSendMessage',(message,callback) => {
        //before sending the message -> check for Profanity
        const filter = new Filter();
        if(filter.isProfane(message)){
            const err = '(error: profanity is not allowed!!!)';
            return callback(err);
        }
        
        const user = getUser(socket.id);

        if(user){
            io.to(user.room).emit('message',generateMessages(message,user.userName));  
            //after sending the message -->  CALL BACK to the current client
            callback();
        }
    });

    socket.on('disconnect',()=>{  
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message',generateMessages(`${user.userName} has disconnected`,'Admin'));
            io.to(user.room).emit('roomData',{
                room: user.room,
                usersList: getUsersInRoom(user.room)
            });
        }
    })

    socket.on('userSendLocation',(coords,callback)=>{
        const url = `https://google.com/maps?q=${coords.latitude},${coords.longtitude}`;

        const user = getUser(socket.id);

        if(user){
            io.to(user.room).emit('locationMessage',generateMessages(url,user.userName));
            callback();
        }
    })
});

const port = process.env.PORT || 3000;
server.listen(port,() => {
    console.log(`listening on port ${port}`);
});