const socket = io();

//Elements
const chatSubmitHandler = document.querySelector('#chatbox');
const messageText = chatSubmitHandler.querySelector('input');
const messageFormButton = chatSubmitHandler.querySelector('button');
const locationSendHandler = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    //new msg element
    const $newMessage = $messages.lastElementChild

    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //Visible Height
    const visibleHeight = $messages.offsetHeight;

    // height of messages container
    const containerHeight = $messages.scrollHeight;

    //how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    //scroll if we are at bottom
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message', (message) => {
    console.log(message.text);
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        username: message.username,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('locationMessage', (url) => {
    //console.log(url);
    const html = Mustache.render(locationTemplate, {
        url: url.url,
        username: url.username,
        createdAt: moment(url.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        users,
        room
    })
    document.querySelector("#sidebar").innerHTML = html;
})


chatSubmitHandler.addEventListener('submit', (event) => {
    event.preventDefault();

    messageFormButton.setAttribute('disabled', 'disabled');
    socket.emit('sendMessage', messageText.value, (error) => {
        messageFormButton.removeAttribute('disabled', 'disabled');
        messageText.value = "";
        messageText.focus();

        if (error) {
            return console.log(error);
        }
        console.log('message delivered');
    })
})


locationSendHandler.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    locationSendHandler.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit('sendLocation', { latitude, longitude }, (ack) => {
            locationSendHandler.removeAttribute('disabled', 'disabled');
            console.log(ack);
        });
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
});

