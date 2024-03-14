const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('.'));

function getRandomColor() {
    const color = Math.floor(Math.random() * 16777215).toString(16);
    return "#" + "0".repeat(6 - color.length) + color;
}

let users = [];

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        const index = users.findIndex(user => user.id === socket.id);
        if (index !== -1) {
            users.splice(index, 1);
            io.emit('userLeft', socket.username);
        }
    });

    socket.on('join', (userData) => {
        const color = getRandomColor();
        userData.color = color;
        userData.id = socket.id;
        users.push(userData);
        io.emit('userJoined', userData);
    });

    socket.on('chat message', (msg) => {
        const user = users.find(u => u.id === socket.id);
        if (user) {
            io.emit('chat message', { ...msg, color: user.color });
        }
    });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});