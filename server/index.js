const express = require('express');
const socketio = require('socket.io')
const http = require('http');
const cors = require("cors")

const { addUser, removeUser, getUser, getUsersInRoom} = require("./users")


const PORT = process.env.PORT || 5000

const router = require('./router');

const app = express();
app.use(cors())
const server = http.createServer(app);
const io = socketio(server,{cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }});

io.on('connection',(socket) => {
    
    socket.on('join', ({name,room}, callback) => {
        console.log("user has joined :)")
        const {error, user} = addUser({id: socket.id, name, room});

        if(error) return callback(error);

        socket.emit('message',{user: 'admin', text: `${user.name}, Welcome to the room`})

        socket.broadcast.to(user.room).emit('message', {user: 'admin',text: `${user.name}, has joined!`})
    
        socket.join(user.room)

        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
        callback();
        
    })


    socket.on('sendMessage', (message,callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message',{user: user.name, text: message})

        callback();
    })

    socket.on('disconnect', () => {
        console.log("user has left!!");
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message',{user: 'admin', text: `${user.name} has left!`})
            io.to(user.room).emit('roomData',{room: user.room, users: getUsersInRoom(user.room)})
        }
    })
})


app.use(router);

server.listen(PORT, () => console.log(`Server has started on ${PORT}`));