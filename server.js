import { createServer } from 'http';
import { Server } from 'socket.io';

let userlist = []
const port = 3000;

const httpServer = createServer();
const io = new Server(httpServer,{
    pingInterval: 360000,
    pingTimeout: 360000
})

httpServer.listen(port);
//http://127.0.0.1:3000

console.log(`Server listening on port: ${port}`);

io.of('/').on('connect',(socket)=>{
    console.log('CLient connected');

    socket.on('join',(data)=>{
        console.log(`Amount of clients: ${io.of('/').server.engine.clientsCount}`);
        userlist.push({
            socketID: socket.id,
            username: data.sender
        })
        socket.username = data.sender;
        socket.broadcast.emit('join',data);
    })

    socket.on('broadcast-message',(data)=>{
        socket.broadcast.emit('broadcast-message',data);
        socket.emit('broadcast-message',data);
    })

    socket.on('direct-message',(data)=>{
        if(data.sender === data.receiver){
            return socket.emit('message-from-server',{
                'message': "[ERROR] Can't message yourself, pick another user"
            })
        }

        let foundUser = userlist.find(user => user.username === data.receiver);
        if(foundUser){
            io.to(foundUser.socketID).emit('direct-message',{
                'sender': data.sender,
                'message': data.message
            })
            socket.emit('message-from-server',{
                'message': `Direct message sent to <${data.receiver}>!`
            })
        }
        else{
            socket.emit('message-from-server',{
                'message': `[ERROR] Message couldn't be sent, no user <${data.receiver}>`
            })
        }
    })

    socket.on('disconnect',(reason)=>{
        userlist = userlist.filter((user)=> user.socketID !== socket.id);
        console.log(`Client disconnected, reason: ${reason}`);
    })

    socket.on('leave',(data)=>{
        socket.broadcast.emit('leave',data);
        socket.disconnect(true);
    })

    socket.on('get-users',()=>{
        let users = []
        userlist.forEach((user)=>{
            users.push(user.username)
        })
        socket.emit('get-users',{
            'users': users
        })
    })

    socket.on('change-username',(data)=>{
        let currentUser = userlist.find(user => user.username === data.sender);
        if(currentUser){
            const oldUsername = currentUser.username;
            currentUser.username = data.newUsername;
            socket.username = data.newUsername
            socket.emit('message-from-server',{
                'message': `Your username has been changed to ${data.newUsername}`
            })
            socket.broadcast.emit('change-username',{
                'oldUsername': oldUsername,
                'newUsername': data.newUsername
            })
        }
        else{
            socket.emit('message-from-server',{
                'message': `[ERROR] Error changing username...`
            })
        }
    })
})