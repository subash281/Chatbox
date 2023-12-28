// Import required modules
const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes')
const User = require('./models/User');
const Message = require('./models/Message')
const rooms = ['subash room', 'node js', 'react room', 'js room'];
const cors = require('cors');

// Middleware setup
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

// Define routes
app.use('/users', userRoutes)
require('./connection')

// Create an HTTP server and configure Socket.io
const server = require('http').createServer(app);
const PORT = 5001;
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

// Function to get the last messages from a room
async function getLastMessagesFromRoom(room){
  let roomMessages = await Message.aggregate([
    {$match: {to: room}},
    {$group: {_id: '$date', messagesByDate: {$push: '$$ROOT'}}}
  ])
  return roomMessages;
}

// Function to sort room messages by date
function sortRoomMessagesByDate(messages){
  return messages.sort(function(a, b){
    let date1 = a._id.split('/');
    let date2 = b._id.split('/');

    date1 = date1[2] + date1[0] + date1[1]
    date2 =  date2[2] + date2[0] + date2[1];

    return date1 < date2 ? -1 : 1
  })
}

// Socket connection handling
io.on('connection', (socket)=> {

  // Event: new-user
  socket.on('new-user', async ()=> {
    const members = await User.find();
    io.emit('new-user', members)
  })

  // Event: join-room
  socket.on('join-room', async(newRoom, previousRoom)=> {
    socket.join(newRoom);
    socket.leave(previousRoom);
    let roomMessages = await getLastMessagesFromRoom(newRoom);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    socket.emit('room-messages', roomMessages)
  })

  // Event: message-room
  socket.on('message-room', async(room, content, sender, time, date) => {
    const newMessage = await Message.create({content, from: sender, time, date, to: room});
    let roomMessages = await getLastMessagesFromRoom(room);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    // Sending message to room
    io.to(room).emit('room-messages', roomMessages);
    socket.broadcast.emit('notifications', room)
  })

  // HTTP route: logout
  app.delete('/logout', async(req, res)=> {
    try {
      const {_id, newMessages} = req.body;
      const user = await User.findById(_id);
      user.status = "offline";
      user.newMessages = newMessages;
      await user.save();
      const members = await User.find();
      socket.broadcast.emit('new-user', members);
      res.status(200).send();
    } catch (e) {
      console.log(e);
      res.status(400).send()
    }
  })

})

// HTTP route: rooms
app.get('/rooms', (req, res)=> {
  res.json(rooms)
})

// Start the server
server.listen(PORT, ()=> {
  console.log('listening to port', PORT)
})

