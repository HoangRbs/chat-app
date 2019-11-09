const socket = io();

//elements
const $sendLocationButton = document.querySelector('#send-location'); 
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button'); 
const $messages_section = document.querySelector('#messages-section');

//templates
const userMessageTemplate = document.querySelector('#userMessageTemplate').innerHTML;
const userMessageLocationTmpl = document.querySelector('#userMessageLocationTmpl').innerHTML;
const sidebarTmpl = document.querySelector('#sidebarTmpl').innerHTML;

const autoScroll =() => {
    const $lastMessage = $messages_section.lastElementChild;
    const lastMessageStyle = getComputedStyle($lastMessage);
    const lastMessage_marginbt = parseInt(lastMessageStyle.marginBottom);

    const lastMessage_totalHeight = $lastMessage.offsetHeight + lastMessage_marginbt; 

    const offsetScroll = $messages_section.scrollTop + $messages_section.offsetHeight;

    if(offsetScroll >= $messages_section.scrollHeight - 2*lastMessage_totalHeight){
        $messages_section.scrollTop = $messages_section.scrollHeight;
    }
}

socket.on('message',(messageObj) => {
    //console.log(messageObj);
    
    const html = Mustache.render(userMessageTemplate,{
        message: messageObj.text,
        createdAt: messageObj.createdAt,
        userName: messageObj.userName
    });

    $messages_section.insertAdjacentHTML('beforeend',html);
    autoScroll();
});

socket.on('locationMessage',(messageObj) => {
    //console.log(messageObj);

    const html = Mustache.render(userMessageLocationTmpl,{
        url: messageObj.text,
        createdAt: messageObj.createdAt
    });

    $messages_section.insertAdjacentHTML('beforeend',html);
    autoScroll();
})

$messageForm.addEventListener("submit",(event) => {
    event.preventDefault();
    
    //const message = event.target.elements.messageInput.value;
    const message = $messageFormInput.value;

    $messageFormButton.setAttribute('disabled','disabled');

    socket.emit('userSendMessage',message,(err) => {
        
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        
        if(err){
            return console.log(err);
        }
        //console.log('(message delivered)');
    });
});


$sendLocationButton.addEventListener('click',(e)=>{
    $sendLocationButton.setAttribute('disabled','disabled');

    e.preventDefault();

    if(!navigator.geolocation)
        return alert('geolocation is not supported by your browser');
    
    navigator.geolocation.getCurrentPosition((position) => {
        const coords = {
            latitude: position.coords.latitude,
            longtitude: position.coords.longitude
        }

        socket.emit('userSendLocation',coords,() => {
            //console.log('(location shared!!)');
           $sendLocationButton.removeAttribute('disabled');
        });
    });
});

const userJoinInfo = location.search;
socket.emit('userJoin',userJoinInfo,(error) => {
    location.href = "./";
    alert(error);
});

socket.on('roomData',({room,usersList}) => {

    const sidebarMarkup = Mustache.render(sidebarTmpl,{
        room,
        usersList
    });

    document.querySelector('#sidebar').innerHTML = sidebarMarkup;
});