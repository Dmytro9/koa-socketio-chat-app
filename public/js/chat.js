const socket =  io();

socket.on('countUpdated', data => {
    console.log('The cout has been updated ', data);
});


document.querySelector('#increment').addEventListener('click', () => {
    console.log('Clicked')
    socket.emit('increment')
})