const Koa = require('koa');
const IO = require('koa-socket-2');
const serve = require('koa-static');
const Fitler = require('bad-words');
const { generateMessage } = require('./utils/messages');

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

  socket.on('join', ({ username, room }) => {
    socket.join(room);

    socket.emit('message', generateMessage('Welcome!')); // Send only to one client on connection
   
    socket.broadcast
      .to(room)
      .emit(
        'message',
        generateMessage(`${username} has joined the room ${room}!`)
      ); // Sends a message to all active connections in a room except the current connection.
  });

  socket.on('message', (msg, callback) => {
    const filter = new Fitler();

    if (filter.isProfane(msg)) {
      return callback('Profanity is not allowed!');
    }

    io.to('one').emit('message', generateMessage(msg));
    // app._io.emit('message', generateMessage(msg)); // Send to all client
    callback('Delivered');
  });

  socket.on('sendLocation', (coords, callback) => {
    app._io.emit(
      'locationMessage',
      generateMessage(
        `https://google.com/maps?q=${coords.longitude},${coords.latitude}`
      )
    );
    callback();
  });

  socket.on('disconnect', () => {
    app._io.emit('message', generateMessage('User has left the chat!'));
  });
});

app.listen(port, () => console.log(`Server listening ${port}`));
