var socket = io();

var myParagraph = document.getElementById("log");
myParagraph.innerHTML = document.cookie;

$('#post-chat').click(function(){
    var msg = '{"msg" : "' + $('#m').val() + '","username" : "' + retrieveUsername(document.cookie) + '"}';
    myParagraph.innerHTML = msg;
    socket.emit('chat message', msg);
    $('#m').val('');
    return false;
});

socket.on('chat message', function(msg){
        var newMessage = formChatMessage(msg);
        $('#content-chats').append(newMessage);
  });

function retrieveUsername(cookie){
    var username = cookie.split('=')[1];
    return username;
   };


function formChatMessage(msg){              
    var newMessage = [  '<a href="#" class="list-group-item">',
        '<div style="float:left; color:blue;"><h6><strong>' + msg.username + '</strong></h6></div>&nbsp;',
        '<div style="float:right ; color:blue;"><h6><strong>' + msg.timestamp + '</strong></h6></div>',
        '<div>&nbsp;</div>',
        '<div>'+ msg.msg + '</div></a>' ].join("\n");
    return newMessage;
}