const socket =  io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormArea = document.querySelector('#message-form textarea'); 
const $messageFormBtn = document.querySelector('#message-form button'); 
const $sendLocationbtn =  document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const urlTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;


// Options
const { username, room  } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom); 
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


// Handlers
socket.on('message', message => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm:ss a') 
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('locationMessage', data => {
    console.log(data.text);
    const html = Mustache.render(urlTemplate, {
        username: data.username,
        url: data.text,
        createdAt: moment(data.createdAt).format('h:mm:s a') 
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
});



// Listeners

// Messages
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

// Location
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


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/';
    }
});
