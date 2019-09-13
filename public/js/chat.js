const socket =  io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormArea = document.querySelector('#message-form textarea'); 
const $messageFormBtn = document.querySelector('#message-form button'); 
const $sendLocationbtn =  document.querySelector('#send-location');
const $messages = document.querySelector('#messages');


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const urlTemplate = document.querySelector('#url-template').innerHTML;


socket.on('message', message => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        message
    });
    $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', url => {
    console.log(url);
    const html = Mustache.render(urlTemplate, {
        url
    });
    $messages.insertAdjacentHTML('beforeend', html);
});


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // const textarea = document.querySelector('#message-form textarea'); // e.target.elements[name].value  // - should be name attr 
    const message = $messageFormArea.value;
    $messageFormBtn.setAttribute('disabled', 'disabled');

    if (message.trim().length) {
        socket.emit('message', message, (msg) => console.log(msg));
        $messageFormArea.value = '';
    }
    $messageFormBtn.removeAttribute('disabled');
    $messageFormArea.focus();
});

$sendLocationbtn.addEventListener('click', () => {
    if ( !navigator.geolocation ) {
        return alert('Geolocation is not supported by your browser');
    }

    $sendLocationbtn.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition(position => {
        socket.emit(
            'sendLocation', 
            {latitude: position.coords.latitude,
            longitude: position.coords.longitude}, 
            () => {
                console.log("Location shared!");
                $sendLocationbtn.removeAttribute('disabled');    
            });
    });
});
