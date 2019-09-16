const Koa = require('koa');
const IO = require('koa-socket-2');
const serve = require('koa-static');
const Fitler = require('bad-words');
const { generateMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

// Port
const port = process.env.PORT || 3001;

// Init koa server
const app = new Koa();

// Static
app.use(serve('./public'));

// Init socketIO connection
const io = new IO();
io.attach(app);

// Handlers
app._io.on('connection', socket => {
  // socket.broadcast.emit('message', generateMessage('New user has joined the chat!')); // Send to all client except current connection

  socket.on('join', (options, callback) => {

    const { error, user } = addUser({id: socket.id, ...options});

    if (error) {
        return callback(error)
    }

    socket.join(user.room);

    socket.emit('message', generateMessage('Admin', 'Welcome!')); // Send only to one client on connection
   
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessage('Admin', `${user.username} has joined the room ${user.room}!`)
      ); // Sends a message to all active connections in a room except the current connection.

      io.to(user.room).emit('roomData', {
          room: user.room,
          users: getUsersInRoom(user.room)
      });

      callback();
  });

  socket.on('message', (msg, callback) => {
    const filter = new Fitler();

    if (filter.isProfane(msg)) {
      return callback('Profanity is not allowed!');
    }

    const user = getUser(socket.id);

    io.to(user.room).emit('message', generateMessage(user.username, msg));
    // app._io.emit('message', generateMessage(msg)); // Send to all client
    callback('Delivered');
  });

  socket.on('sendLocation', (coords, callback) => {

    const user = getUser(socket.id);

    io.to(user.room).emit(
      'locationMessage',
      generateMessage(
        user.username,
        `https://google.com/maps?q=${coords.longitude},${coords.latitude}`
      )
    );

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
        io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
  
    }
    
  });
});

app.listen(port, () => console.log(`Server listening ${port}`));
