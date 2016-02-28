Util.info(__filename + " loaded.");

GLOBAL.app = require('express')();
GLOBAL.http = require('http').Server(app);
GLOBAL.hio = require('socket.io')(http);

GLOBAL.sockets = {};
GLOBAL.player = {};

GLOBAL.port = 6662;
GLOBAL.listenport = 6661;

GLOBAL.server = net.createServer(newSocket);


app.get('/', function(req, res){
  Util.info("Redirecting to webpage...");
  res.sendFile(__dirname + '/iv3.html');
});


setTimeout( function() {
  http.listen( port, function(){
    Util.info('listening on *:'+port);
  }); }, 2000);

hio.on('connection', function(socket) {

  if ( copyoverdat.size != 0 )
  {
    Util.debug("Requesting copyover info.");
    socket.emit('copyoverlogin','');
  }
  else
  {
    socket.emit('info',config.greeting.color(true));
  }

  player[socket.id] = new character(socket);

  Util.announce(socket);

  socket.on('nocopyover', function(msg) { 
    socket.emit('info',config.greeting.color(true));
  });

  socket.on('formlogin', function(msg) {
    Util.debug("Login received: " + msg );
    var data = msg.split("::");
    var name = data[0];
    var pass = data[1];

    async.waterfall([
        function(callback) {
          player[socket.id].id = socket.id.toString();
          socket.emit("id", player[socket.id].id);
          var query = "SELECT name,passwd FROM players WHERE name=?";
          db.query(query, name, function( err, rows, fields ) {
            if (err) throw err;

            if ( rows.length == 0 )
            {
              socket.emit("clear","");
              socket.emit("loginmsg","Character not found.");
              sio.state(socket,0);
              return;
            }

            for ( var i in rows ) {
              if ( typeof( rows[i]) == "function" )
              {
                Util.debug("Function: " + JSON.stringify(rows[i]));
                return;
              }

              player[socket.id].pass = rows[i].passwd;
              player[socket.id].name = rows[i].name;
              if ( pass == player[socket.id].pass ) {
                socket.emit("id", player[socket.id].id);

                player[socket.id].name = name.cap();
                   save.loadPlayer( player[socket.id] );
                socket.emit('copyoversuccess', player[socket.id].name);
                Util.msgall(player[socket.id].name + " has connected.", null, "chat");

                setTimeout(function() { sio.state(socket,4); act_info.doLook(socket,""); },10);
i
              }
              else
              {
                socket.emit("loginmsg","Invalid password.");
              }
            }

            callback(null,callback);
          });
        } ], function(err, results) { } );

    return;
  });

  socket.on('formcreate', function(msg) {
        Util.debug("Login received: " + msg );

    var data = msg.split("::");
    var name = data[0];
    var pass = data[1];
    var email = data[2];

    async.waterfall([
        function(callback) {
          okayname = isValidName(name);
          callback(null,okayname);
        },
        function(arg1,callback) {
          if ( !okayname ) {
            socket.emit('loginmsg',"That is an invalid name. Please try again.");
            return;
          }
          var query = "SELECT name FROM players WHERE name=?";
          db.query(query, name, function( err, rows, fields ) {
            if (err) throw err;
            if ( rows.length == 0 )
            {
              okayname = true;
              callback(null,callback);
            }
            for ( var i in rows ) {
              okayname = false;
              callback(null,callback);
            }
          });
        }], function(err, results) {
          if ( !okayname ) { socket.emit('loginmsg','That name is already in use. Try again.'); return; }
          socket.emit("id", player[socket.id].id);

          player[socket.id].name = name.cap();
          player[socket.id].pass = pass;
          player[socket.id].email = email;
          Util.info("New character: " + player[socket.id].name);
          socket.emit('copyoversuccess', player[socket.id].name);
          var post = {name: player[socket.id].name, passwd: pass };
          var query = "INSERT INTO players SET ?;";
          db.query(query,post);
          Util.msg(socket,"Welcome aboard!");
          Util.msgall(player[socket.id].name + " has begun adventuring on Ivalice!", null, "chat");

          setTimeout(function() { sio.state(socket,4) },10);
        });
    return;
  });


  socket.on('error', function (err) {     console.error(err.stack);   });
  socket.on('disconnect', function() {

    for ( var x in player ) { 
      if ( player[x].sock != socket )
        continue;

      async.waterfall([
          function(callback) { save.savePlayer(player[socket.id]); 
            callback(null,callback);
          },
          function(arg1,callback) { 
            if ( player[socket.id].state == 4 )
            {
              Util.msgall(player[socket.id].name + " has disconnected.",null, "chat");
            }
            Util.info("Disconnected: " + player[socket.id].name + " - " + player[socket.id].ip);
            callback(null,callback);

          } ], function (err, results) { 
            //Util.debug("Removing " + player[socket.id].name);
            delete player[socket.id];
          });
    }
  });

  socket.on('ping', function() {
        socket.emit('pong');
          });

  socket.on('copyoverlogin', function(data) {
    var info;
    try {
      info = (data);
    }
    catch (e) {
      Util.info("Error reading JSON info: " + JSON.stringify(data));
      return;
    }

    data = JSON.stringify(data);

    Util.info("Copyover Login received: " + data);
    if ( copyoverdat[info.id] )
    {
      if ( copyoverdat[info.id] == info.name )
      {
        Util.info("Copyover Data Match");
        player[socket.id].name = info.name;
        Util.msg(socket,"Automatically logged in ... Welcome back, " + info.name);
        save.loadPlayer( player[socket.id] );
        Util.msgall(player[socket.id].name + " has reconnected!", null, "chat");
        socket.emit('copyoversuccess', player[socket.id].name);
        setTimeout(function() { sio.state(socket,4) },10);
        delete copyoverdat[info.id];
        return;
      }
      else
      {
        socket.emit('info',config.greeting.color(true));
        Util.info("No Match " + copyoverdat[info.id] + " : " + info.name );
        return;
      }
    }
    else
    {
      socket.emit('info',config.greeting.color(true));
      Util.info("Copyover data does not match.");
      return;
    }

    return;
  });

  socket.on('input',function(data) {
    var user = data.substr(0,data.indexOf("~"));
    var msg  = data.substr(user.length+1).trim();
    var pass = "";
//    Util.debug("User: " + user + " Msg: " + msg);
//

    if ( player[socket.id].state != 4 )
      return;

    functions.checkCommand(msg,socket);

  });
  socket.on('info', function(msg) {
    hio.emit('info',msg);
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

