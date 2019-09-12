const Koa = require('koa');
const IO = require('koa-socket-2');
const serve = require('koa-static');
const port = process.env.PORT || 3000
 
const app = new Koa();
app.use(serve('./public'));

const io = new IO();
io.attach(app);
 

app._io.on('connection', (socket) => {

    socket.emit('message', 'Welcome!'); // Send only to one client on connection
    socket.broadcast.emit('message', 'New user has joined the chat!'); // Send to all client except current connection

    socket.on('message', (msg, callback) => {
        app._io.emit('message', msg); // Send to all client
        callback('Delivered');
    });

    socket.on('sendLocation', coords => {
        app._io.emit('message', `https://google.com/maps?q=${coords.longitude},${coords.latitude}`);
    });

    socket.on('disconnect', () => {
        app._io.emit('message', 'User has left');
    });
       
});

app.listen( port, () => console.log( `Server listening ${port}` ) );