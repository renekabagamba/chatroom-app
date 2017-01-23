var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var jade = require('jade');
var fs = require('fs');
var moment = require('moment');
var bodyParser = require ('body-parser');
var cookieParser = require('cookie-parser');
var sqlite3 = require('sqlite3').verbose()

/*var html_login = jade.renderFile('index.jade', {});*/
/*app.use(express.static(path.join(__dirname, 'public')));*/
app.use(express.static('public'));
app.use( bodyParser.json() );       
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser()); 


// Create Database file if none(handled by the below command)
// chats table
// timestamp | message | author
var db = new sqlite3.Database('chatroom.db');

db.serialize(function () {
  db.run('CREATE TABLE IF NOT EXISTS chats (timestamp TEXT,\
    message TEXT, author TEXT )')

});


app.get('/', function(req, res){
  res.sendFile(__dirname + '/login.html');
});

app.post('/', function(req, res){
    var username = req.body.username;
    res.cookie('user', req.body.username);
    res.sendFile(__dirname +  '/chatroom.html');
});

/*app.get('/', function(req, res){
  res.send(html_login);
});*/



io.on('connection', function(socket){
  console.log('a user connected');

  // Log all messages in database for a new user connecting
  db.serialize(function () {
    db.each('SELECT * FROM chats', function (err, row) {
      console.log(row.timestamp + ': ' + row.message + ': '+ row.author);
      io.emit('chat message',  {'timestamp' : row.timestamp, 'msg' : row.message,
                                'username' : row.author});

    })
  });

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    var newMessage = JSON.parse(msg);
    var currentTime = moment(new Date()).format('MM.DD.YYYY H:mmA');
    newMessage.timestamp = currentTime;
    
    // Store any new message into the DB
    db.serialize(function () {
        
        var stmt = db.prepare('INSERT INTO chats VALUES (?,?,?)')
        stmt.run(newMessage.timestamp, newMessage.msg, newMessage.username)
        stmt.finalize()
    });

    io.emit('chat message', newMessage);

  });


  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

});


http.listen(3000, function(){
  console.log('listening on *:3000');
});