const Koa = require('koa');
const IO = require('koa-socket-2');
const serve = require('koa-static');
const port = process.env.PORT || 3000
 
const app = new Koa();
app.use(serve('./public'));

const io = new IO();
 
io.attach(app);

let count = 0;

app._io.on('connection', (socket) => {
    console.log('New socket connection');
    socket.on('increment', data => {
        count++;
        app._io.emit('countUpdated', count);
    })
       
});

app.listen( port, () => console.log( `Server listening ${port}` ) );