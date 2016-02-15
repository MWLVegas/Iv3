GLOBAL.app = require('express')();
GLOBAL.http = require('http').Server(app);
GLOBAL.sio = require('socket.io')(http);
GLOBAL.sockets = [];
GLOBAL.player = [];

GLOBAL.port = 6662;
GLOBAL.listenport = 6661;

GLOBAL.debug = true;
GLOBAL.server = net.createServer(newSocket);


app.get('/', function(req, res){
  Util.info("Redirecting to webpage...");
  res.sendFile(__dirname + '/iv3.html');
});

setTimeout( function() {

http.listen( port, function(){
  Util.info('listening on *:'+port);
});
}, 1500);


sio.on('connection', function(socket) {
  player[socket.id] = new character(socket);
  socket.emit('info',config.greeting.color(true));

  Util.announce(socket);

  socket.on('error', function (err) {     console.error(err.stack);   });
  socket.on('disconnect', function() {

    for ( var x in player ) { 
      if ( player[x].sock != socket )
        continue;

      save.savePlayer(player[socket.id]);
      if ( player[socket.id].state == 4 )
        Util.msgall(player[socket.id].name + " has disconnected.",null, "chat");

//      Util.cmd( socket, "disconnect", "");
      Util.info("Disconnected: " + player[socket.id].name + " - " + player[socket.id].ip);
      delete player[socket.id];
    }
  });

  socket.on('input',function(data) {
    var user = data.substr(0,data.indexOf("~"));
    var msg  = data.substr(user.length+1).trim();
    var pass = "";
    Util.debug("User: " + user + " Msg: " + msg);

    if ( player[socket.id].name != "new" && player[socket.id].name != "Unknown" && player[socket.id].name != "" )
    {
    }

    if ( msg.toUpperCase() == 'CANCEL' ) { Util.msg(socket,"Okay ... enter your name!"); return; }

    if ( msg.toUpperCase() == 'NEW' ) { Util.msg(socket,"Welcome to Ivalice! Please enter your name."); player[socket.id].name = "new"; return; };
    name = msg.cap();
    var okayname = false;
    
    if ( player[socket.id].name == "new" ) {
      async.parallel({ 
        validname: function(callback) {
          okayname = isValidName(name);
          callback(null,okayname);
        },
        checkname: function(callback) {
          if ( !okayname ) {
            Util.msg(socket,"That is an invalid name. Please try again."); 
            return;
          }
          var query = "SELECT name FROM players WHERE name=?";
          db.query(query, name, function( err, rows, fields ) {
            if (err) throw err;
            if ( rows.length == 0 )
            {
              okayname = true;
              callback(null,"ok");
            }
            for ( var i in rows ) {
              okayname = false;
              callback(null,"no");
            }
          });
        } }, function(err, results) { 
          if ( !okayname ) { Util.msg(socket,"That name is already in use. Try again."); return; }

          Util.msg(socket,"And what will your password be?");
          Util.cmd(socket,"newpass", "");
          player[socket.id].name = msg.cap();
          Util.info("New character: " + player[socket.id].name);
          io.state(socket, 3);
        });
      return;
    }


    if ( user == "" ) { // Not logged in yet
//      Util.msg(socket,"Checking character name ...");
      login.checkNewUser(msg,socket);

      return;
    }

    functions.checkCommand(msg,socket);

  });

  socket.on('newpass', function( data ) {
    var pass;
    var name;
    async.parallel({
      pass: function(callback) { pass = Util.decrypt(data,player[socket.id].id);
        player[socket.id].pass = pass.toString();

        var name = Util.encrypt( player[socket.id].name, player[socket.id].id);
        player[socket.id].dec = name;

        callback(pass); },
      name: function(callback){ 
        name = Util.encrypt(player[socket.id].name, player[socket.id].id );
        player[socket.id].dec = name;
        callback(null,name);
      }
    }, function(err, results) {

      var pass1 = player[socket.id].pass.toString();
      if ( pass1 == undefined || pass1.trim().length == 0 )
      {
        socket.emit('error', "There has been an error with your character creation. Please refresh your screen (F5) and try to recreate it. Sorry!");
        socket.disconnect();
        return;
      }

      var post = {name: player[socket.id].name, passwd: pass };
      Util.debug(post);
      var query = "INSERT INTO players SET ?;";
      db.query(query,post);
      Util.msg(socket,"Welcome aboard!");
      socket.emit('loggedin', player[socket.id].dec );

      Util.msgall(player[socket.id].name + " has begun adventuring on Ivalice!", null, "chat");
      setTimeout(function() { io.state(socket,4) },10);
    });
  });

  socket.on('pass', function(data) { // Existing Character

    if ( !player[socket.id].pass ) { // some kind of error 
      player[socket.id].name = Util.decrypt(data.substr(1));
      login.checkNewUser(data.substr(1),socket);
      return;
    }

    var pass;
    var name;
    async.parallel({
      pass: function(callback) { pass = Util.decrypt(data,player[socket.id].id);
        callback(null,pass); },
      name: function(callback){ 
//        player[socket.id].pass = pass;
        name = Util.encrypt(player[socket.id].name, player[socket.id].id );
        player[socket.id].dec = name;
        callback(null,name);
      }
    }, function(err, results) {
      
      if ( player[socket.id].pass == pass ) { // good pass
          Util.msg(socket,"Welcome back, " + player[socket.id].name);
          save.loadPlayer( player[socket.id] );
          Util.msgall(player[socket.id].name + " has connected!", null, "chat");
                socket.emit('loggedin', player[socket.id].dec);
                io.state(socket,4);
      }
      else {
        Util.msg(socket,"Invalid password. Try again. Enter 'cancel' to go back to character selection.");
        return;
      }
    });
  });
  socket.on('login', function(data) {

    Util.debug(data);
    if (data == "" )
    {
      player[socket.id].name = "";
      Util.msg(socket,"There is no character by that name ... Are you new?");
      Util.msg(socket,"If so, type 'new' for your name.");
      Util.cmd(socket,"clear","");
      return;
    }
    else
    {
      player[socket.id].pass = data;
      Util.msg(socket,"Enter your password.");
      socket.emit("password","");
      return;
    }

  });

  socket.on('info', function(msg) {
    sio.emit('info',msg);
  });

});

function closeSocket(socket) {
  var i = sockets.indexOf(socket);
  if (i != -1) {
    sockets.splice(i, 1);
  }
}

function newSocket(socket) {
  sockets.push(socket);
  socket.on('data', function(data) {
    receiveData(socket, data);
  })
  socket.on('end', function() {
    closeSocket(socket);
  })
  socket.on('error',function(err) {
  })
}

function cleanInput(data) {
  return data.toString().replace(/(\r\n|\n|\r)/gm,"");
}

function receiveData(socket, data) {
  var cleanData = cleanInput(data);
  //console.log(data);
  process(cleanData);
}

function process(data) {
  Util.info(data);
}

function isValidName(name) {
  if ( name.length > 20 )
  {
    Util.debug("name is too long.");
    return false;
  }

  if ( !/^[a-zA-Z]+$/.test(name) )
  {
    Util.debug("name contains a number");
    return false;
  }

  return true;
}

module.exports = {
  state : function(socket,state) {
  player[socket.id].state = state;
  socket.emit('state', state);
  Util.debug("Updating " + player[socket.id].id  + " to " + state);

  if ( state == 4 )
  {
    for ( var x in player )
    {
      if ( player[x].id != player[socket.id].id && player[socket.id].name == player[x].name )
      {
        var sock = player[x].sock;
        Util.msg(sock,"Another connection has overriden this one.");
        sock.disconnect();
      }
    }
  }

  }
}

