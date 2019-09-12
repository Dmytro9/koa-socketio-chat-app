const socket =  io();

socket.on('message', msg => {
    console.log(msg);
});

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const textarea = document.querySelector('#message-form textarea'); // e.target.elements[name].value  // - should be name attr 
    const message = textarea.value;
    if (message.trim().length) {
        socket.emit('message', message, (msg) => {
            console.log('The message was delivered! ', msg);
        });
        textarea.value = '';
    }
    textarea.focus();
});

document.querySelector('#send-location').addEventListener('click', () => {
    if ( !navigator.geolocation ) {
        return alert('Geolocation is not supported by your browser');
    }

    navigator.geolocation.getCurrentPosition(position => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    });
});
