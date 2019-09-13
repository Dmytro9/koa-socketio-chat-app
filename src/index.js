const Koa = require('koa');
const IO = require('koa-socket-2');
const serve = require('koa-static');
const Fitler = require('bad-words');
const port = process.env.PORT || 3000
 
const app = new Koa();
app.use(serve('./public'));

const io = new IO();
io.attach(app);
 

app._io.on('connection', (socket) => {

    socket.emit('message', {
        text: 'Welcome!',
        createdAt: new Date().getTime()
    }); // Send only to one client on connection
    
    socket.broadcast.emit('message', 'New user has joined the chat!'); // Send to all client except current connection

    socket.on('message', (msg, callback) => {

        const filter = new Fitler();

        if ( filter.isProfane(msg) ) {
            return callback('Profanity is not allowed!');
        }

        app._io.emit('message', msg); // Send to all client
        callback('Delivered');
    });

    socket.on('sendLocation', (coords, callback) => {
        app._io.emit('locationMessage', `https://google.com/maps?q=${coords.longitude},${coords.latitude}`);
        callback();
    });

    socket.on('disconnect', () => {
        app._io.emit('message', 'User has left the chat!');
    });
       
});

app.listen( port, () => console.log( `Server listening ${port}` ) );