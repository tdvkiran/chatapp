const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const Filter = require('bad-words');

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketIO(server)

const port = process.env.PORT || 3000;

const publicDirPath = path.join(__dirname, "../public");

app.use(express.static(publicDirPath))

io.on('connection', (socket) => {

    socket.on('join', (options, cb) => {
        const { error, user } = addUser({ id: socket.id, ...options })
        
        if (error) {
            return cb(error);
        }
        //console.log(user);
        socket.join(user.room)
        socket.emit('message', generateMessage('welcome to the chat app','Admin'));

        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`,'Admin'));
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    })

    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id);

        if (user) {
            const filter = new Filter();
            if (filter.isProfane(msg)) {
                return callback('Profanity is not allowed');
            }
            io.to(user.room).emit('message', generateMessage(msg,user.username));
            callback();
        }
    })

    socket.on('sendLocation', (coords, cb) => {
        const user = getUser(socket.id);
        if (user) {
            io.to(user.room).emit('locationMessage', generateLocationMessage(`https://google.com/maps/?q=${coords.latitude},${coords.longitude}`,user.username));
            cb('Location shared');
        }
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            // not using the broadcast as usere already discnnected from the server so the message will not be delivered
            io.to(user.room).emit('message', generateMessage(`${user.username} has left`,'Admin'));
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })
})



server.listen(port, () => {
    console.log('listening on port: ' + port);
})