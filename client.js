const io = require('socket.io-client');
const prompt=require("prompt-sync")({sigint:true}); 

let args = process.argv.slice(2);
if(args.length !== 2){
    console.log('Correct usage: node client [IP-address] [port-number]')
    process.exit(0);
}
const socket = io(`http://${args[0]}:${args[1]}`);

let username;

socket.on('connect',()=>{
    /*while(true){
        await socket.emit('get-users');
        console.log(userlist);
        username = prompt('Username: ');
        if(userlist.includes(username)){
            console.log('Username already in use, pick another one');
        }
        else{
            break;
        }
    }*/
    while(true){
        username = prompt('Username: ');
        if(!username){
            console.log("Please input a valid username, name can't be empty");
        }else {break}
    }

    socket.emit('join',{
        'sender': username,
        'action': 'join'
    })
    console.log(`Connected with user: <${username}>`);
    console.log('Possible commands:');
    console.log("/changename #Change your username");
    console.log("/users #get names of all connected users");
    console.log("/leave #leave the chatroom");
})

socket.on("connect_error", (err) => {
    console.log(`[ERROR] Connection to server failed, reason: ${err.message}`);
    process.exit(0);
  });

socket.on('join',(data)=>{
    console.log(`[NOTICE]<${data.sender}> has joined the chat!`)
})

socket.on('get-users',(data)=>{
    console.log(`Currently connected users: [${data.users}]`);
})


socket.on('broadcast-message',(data)=>{
    console.log(`<${data.sender}>: ${data.message}`);
})

socket.on('direct-message',(data)=>{
    console.log(`[DM]<${data.sender}>: ${data.message}`);
})

socket.on('message-from-server',(data)=>{
    console.log(data.message);
})

socket.on('change-username',(data)=>{
    console.log(`[NOTICE]<${data.oldUsername}> has changed their username to <${data.newUsername}>.`);
})

socket.on('leave',(data)=>{
    console.log(`[NOTICE]<${data.sender}> has left the chat.`);
})

socket.on('disconnect',(reason)=>{
    socket.emit('leave',{
        'sender': username,
        'action': 'leave'
    })
    console.log(`Client disconnected, reason: ${reason}`);
    process.exit(0);
})


//Readline is used to get input from user
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
//rl.on is used to trigger events when the user presses enter
rl.on('line',(input)=>{
    if(input.length == 0){return}

    if(input.startsWith('/leave')){
        console.log('Exiting program...')
        socket.emit('leave',{
            'sender': username,
            'action': 'leave'
        })
    }
    else if(input.startsWith('@')){
        let query = input.slice(1);
        const receiver = query.split(' ')[0];
        const message = query.substring(query.indexOf(' ')+1);
        socket.emit('direct-message',{
            'sender': username,
            'action': 'direct-message',
            'receiver': receiver,
            'message': message
        })
    }

    else if(input.startsWith('/users')){
        socket.emit('get-users')        
    }

    else if(input.startsWith('/changename')){
        while(true){
            let newUsername = prompt('New username: ');
            if(!newUsername){
                console.log("Please input a valid new username, name can't be empty");
            } else{break}
        }
        username = newUsername;
        socket.emit('change-username',{
            'sender': username,
            'newUsername': newUsername
        });
    }

    else{
        socket.emit('broadcast-message',{
            'sender': username,
            'action': 'broadcast-message',
            'message': input
        })
    }
})
//Close is called when user does a keyboardinterrupt with CTRL+C, ends connection
rl.on('close',()=>{
    socket.emit('leave',{
        'sender': username,
        'action': 'leave'
    })
})