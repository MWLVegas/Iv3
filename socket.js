Util.info(__filename + " loaded.");

GLOBAL.app = require('express')();
GLOBAL.http = require('http').Server(app);
GLOBAL.hio = require('socket.io')(http);

GLOBAL.sockets = {};
GLOBAL.characters = {};
GLOBAL.players = {};
GLOBAL.mobs = [];

GLOBAL.port = 6662;
GLOBAL.listenport = 6661;

//GLOBAL.server = net.createServer(newSocket);
//

GLOBAL.server = net.createServer( function(c) {
  console.log("Server connceted");
  c.on('end', function() {
    console.log('server disco');
  });
  c.pipe(c);
});


app.get('/', function(req, res){
  Util.info("Redirecting to webpage...");
  res.sendFile(__dirname + '/iv3.html');
});


setTimeout( function() {
  http.listen( port, function(){
    Util.info('listening on *:'+port);
  }); }, 2000);

hio.on('connection', function(socket) {

  Util.sendtos(socket);
  if ( copyoverdat.size != 0 )
  {
    Util.debug("Requesting copyover info.");
    socket.emit('copyoverlogin','');
  }
  else
  {
    Util.debug("Con: Sending greeting");
    socket.emit('info',config.greeting.color(true));
  }

  var sock = new includes.Socket(socket); 
  sock.character = new includes.Character(socket);
  sock.player = new includes.Player(socket);

  sock.player["id"] = socket.id;

  sock.character.player = sock.player;
  sock.character.player["socket"] = socket;
  sock.player.character = sock.character;

  sockets[socket.id] = sock;
  sock.character.guid = sockets[socket.id].guid;
  sock.player.guid = sock.character.guid;

  Util.announce(socket);

  socket.on('nocopyover', function(msg) { 
    Util.debug("No copyover info: Sending greeting");
    socket.emit('info',config.greeting.color(true));
  });

  socket.on('formlogin', function(msg) {
    Util.debug("Login received: " + msg );
    var data = msg.split("::");
    var name = data[0];
    var pass = data[1];

    async.waterfall([
        function(callback) {
          sockets[socket.id].id = socket.id;

          socket.emit("id", sockets[socket.id].id);
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
              sockets[socket.id].player.pass = rows[i].passwd;
              sockets[socket.id].player.name = rows[i].name;
              sockets[socket.id].name = rows[i].name;

              if ( pass == sockets[socket.id].player.pass ) {
                socket.emit("id", socket.id);

                loginPlayer( socket.id )
                  /*
                     player[socket.id].name = name.cap(); //remove
                     sockets[socket.id].character.name = name.cap();

                     save.loadPlayer( socket.id ); //remove
                  //                save.loadPlayer( sockets[socket.id].player );

                  socket.emit('copyoversuccess', player[socket.id].name);
                  Util.msgall(player[socket.id].name + " has connected.", null, "chat"); // remove
                  Util.msgall(sockets[socket.id].name + " has connected.", null, "chat");

                  setTimeout(function() { sio.state(socket,4); act_info.doLook( sockets[socket.id].character,""); },10);
                   *
                   * */
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
    Util.debug("Create Login received: " + msg );

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
          
          socket.emit("id", socket.id);

          sockets[socket.id].character.name = name.cap();
          sockets[socket.id].player.pass = pass;
          sockets[socket.id].player.email = email;
          sockets[socket.id].name = name.cap();

          Util.info("New character: " + sockets[socket.id].character.name); //player[socket.id].name);
          socket.emit('copyoversuccess', sockets[socket.id].character.name); //player[socket.id].name);
          var post = {guid: sockets[socket.id].guid, name: sockets[socket.id].character.name, passwd: pass }; //player[socket.id].name, passwd: pass };
          var query = "INSERT INTO players SET ?;";
          db.query(query,post);
          Util.msg(socket,"Welcome aboard!");
          sockets[socket.id].noob = true;
          loginPlayer( socket.id );
  });
});


socket.on('error', function (err) {     console.error(err.stack);   });
socket.on('disconnect', function() {

  var id = socket.id;
  Util.debug("Disconnecting " + socket.id );

  async.waterfall([
      function(callback) {
        save.savePlayer( sockets[id].character );
        callback(null,callback);
      },
      function(arg1,callback) {
        if ( sockets[id].state == 4 )
        {
          Util.msgall(sockets[id].name + " has lost connection.",null, "chat");
        }
        delete sockets[id].player["socket"];//.socket;
        Util.info("Disconnected: " + sockets[id].name + " - " + sockets[id].ip);
        callback(null,callback);

      } ], function (err, results) {
        Util.debug("Removing " + sockets[id].name + " : " + sockets[id].id);
        delete sockets[id];
      });


  /*
     for ( var x in sockets ) {  //fix dis

     if ( sockets[x].id != socket.id )
     continue;

     async.waterfall([
     function(callback) { 
     save.savePlayer( sockets[x].character );
     callback(null,callback);
     },
     function(arg1,callback) { 
     if ( sockets[socket.id].state == 4 )
     {
     Util.msgall(sockets[socket.id].name + " has lost connection.",null, "chat");
     }
     Util.info("Disconnected: " + sockets[x].name + " - " + sockets[x].ip);
     callback(null,callback);

     } ], function (err, results) { 
     Util.debug("Removing " + sockets[x].name);
     delete sockets[x];
     });
     } */
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
      Util.debug("Copyover Data Match");
      sockets[socket.id].name = info.name;
      sockets[socket.id].id = socket.id;
      //Util.msg(socket,"Automatically logged in ... Welcome back, " + info.name);
      Util.debug("Copyover login match : " + info.name + " " + socket.id);
      loginPlayer(socket.id);
      /*        save.loadPlayer( socket.id );
      //        save.loadPlayer( sockets[socket.id].player );

      Util.msgall( sockets[socket.id].character.name + " materializes.", null, "chat");
      socket.emit('copyoversuccess', sockets[socket.id].character.name); //player[socket.id].name);
      setTimeout(function() { sio.state(socket,4) },10);
      */
      delete copyoverdat[info.id];
      return;
    }
    else
    {
      socket.emit('info',config.greeting.color(true));
      //        Util.info("No Match " + copyoverdat[info.id] + " : " + info.name );
      return;
    }
  }
  else
  {
    Util.debug("No copyover match");
    sockets[socket.id].state = 0;
    Util.debug("Sending greeting");
    socket.emit('info',config.greeting.color(true));
    Util.debug("Greeting sent.");
  }

  return;
});

socket.on('input',function(data) {
  var user = data.substr(0,data.indexOf("~"));
  var msg  = data.substr(user.length+1).trim();
  var pass = "";
      Util.debug("User: " + user + " Msg: " + msg);
  //

  if ( sockets[socket.id].state != 4 )
    return;

  //    if ( player[socket.id].state != 4 )
  //      return;

  //    functions.checkCommand(msg,socket);
  functions.checkCommand(msg, sockets[socket.id].character);

});
socket.on('info', function(msg) {
  hio.emit('info',msg);
});

});

function closeSocket(socket) {

  for ( var x in sockets )
  {
    if ( sockets[x].sock == sock )
    {
      socket.splice(x,1);
      return;
    }

  }
  Util.error("Socket not found in socket list");

  //  var i = sockets.indexOf(socket);
  //  if (i != -1) {
  //    sockets.splice(i, 1);
  //  }

}

function newSocket(soc) {
  var sock = new Socket();
  sock.socket = soc;
  sock.id = soc.id;

  sockets.push(sock);
  soc.on('connect', function() {
    Util.debug("connected.");
  });
  soc.on('end', function() {
    closeSocket(soc);
  })
  soc.on('error',function(err) {
  })
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

var state = function(socket,state) {
  socket.emit('state', state);
  Util.debug("Updating " + socket.id  + " to " + state);

  if ( state == 4 )
  {
    for ( var x in sockets )
    {
      if ( sockets[x].id != x && sockets[socket.id].name == sockets[x].name )
      {
        var sock = sockets[socket.id].socket;
        Util.msg(sock,"Another connection has overriden this one.");
        sock.disconnect();
      }
    }
  }

  sockets[socket.id].state = state;
  sockets[socket.id].player.state = state;


}
module.exports.state = state;

function loginPlayer( id )
{
  Util.debug("LoginPlayer: " + id);
  var found = false;

  async.waterfall( [
      function( callback ) {
        if ( sockets[id].noob )
        {
          save.savePlayer(sockets[id].character);
        }
        else
        {
        save.loadPlayer(id);
        }
        callback(null,callback)
      },
      function( arg, callback ) {
        sockets[id].socket.emit('copyoversuccess', sockets[id].name);
        callback(null,callback);
      }, 
      function ( arg, callback ) {

        for ( var x in characters )
        {
          Util.debug("Checking " + characters[x].guid + " vs " + sockets[id].guid );
          if ( characters[x].guid == sockets[id].guid ) // Reconnection
          {
            Character.removePlayer(characters[x]);
            Util.debug("Character found in list- removing");
            found = true;
          }
        }
        callback(null,callback);
      },
      function ( arg, callback ) {


        if ( !found ) {
          if ( sockets[id].noob )
          {
            Util.msgall(sockets[id].name + " has begun adventuring on Iv3!", null, "chat");
          }
          else
          {
          Util.msgall(sockets[id].name + " has connected.", null, "chat");
          }
        }
        else
          Util.msgall(sockets[id].name + " has reconnected.", null, "chat");

        setTimeout(function() { sio.state( sockets[id].socket,4); act_info.doLook( sockets[id].character,""); },10);
        callback(null, callback);
      },
      function ( arg, callback ) {
                var guid = sockets[id].guid;

        Util.debug("Adding player " + guid + " to lists");
        //        players.push( sockets[id].player );
        players[ guid ] = sockets[id].player;
        characters[ guid ] = sockets[id].character;
        //        characters.push( sockets[id].character );
        callback(null,callback);        

      }
  ], function( err, results ) {
    Util.debug("Character logged in.");
  });
}


