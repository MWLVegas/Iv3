
String.prototype.cap = function() {
  return this.charAt(0).toUpperCase() + this.toLowerCase().slice(1);
}

module.exports = {

  delete: function( obj, element) {
    var i = obj.indexOf(element) ;
      if ( i != -1 )
        obj.splice(i,1);
  },
  findTarget: function( socket, target ) {
    for ( var x in player ) {
      if ( player[x].state == 4 && ( player[x].name.toLowerCase() == target.toLowerCase() ||  player[x].name.toLowerCase().startsWith(target.toLowerCase())  ) )
      {
//        Util.debug("findTarget: Found "+ player[x].name);
        return x;
      }
    }

//    Util.debug("findTarget: No Target Found");
    return null;
  },

  msgroom: function ( vnum, msg, plr, channel ) {
//    Util.debug("Room Msg: " + vnum);
//    Util.debug("Messaging Room : " + vnum + " : " + rooms[vnum].name);
    for ( var x in player )
    {
      if ( player[x].state != 4 || player[x].room != vnum)
        continue;

      if ( plr != null && player[x].name == plr )
        continue;

      Util.msg(player[x].sock,msg, channel);
    }
  },
  announce: function( socket ) {

    readfile("announcement.txt", "utf8", function(err,buffer) {
      var txt = buffer;
      if ( txt.trim().length != 0 )
        socket.emit("announce", { title:"Announcement!", data: txt});

    });

  },

  msgall: function (string, room, chan ) {

    for ( var x in player )
    {
      if ( player[x] != undefined )
      {
        if ( player[x].state == 4 )
        {
          if ( room )
            if ( player[x].room != room )
            {
//              Util.debug("Not in same room ...");
              continue;
            }

          Util.msg(player[x].sock,string, chan);
        }
      }
    }
  },

  cap: function( string ) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  cmd: function( socket, command, message ) {
//    Util.debug("Sending " + message + " --- Room: " + command);
    socket.emit(command,message);
    return;
  },
  debug: function(msg) {
    if ( config.debug == true )
    {
      if ( typeof(msg) === 'object' ) 
        msg = JSON.stringify(msg);

      Util.info("[DEBUG] ".red + msg) ;
    }
  },
  error: function(msg) {
    Util.info("ERROR: ".green + msg);

  },
  msg: function(socket,msg,chan,args) {
    for ( var x in args ) {
      var pos = msg.indexOf("%*");

      if ( msg.charAt(pos+2) == '$' )
      {
        var pos2 = msg.indexOf('$',pos+3);
        var str = msg.substr(pos+3, ( pos2 - (pos) )-3 );
        var len = str;
        var formatted =  args[x].toString();
        if ( len < 0 ) // backwards
        {
          if ( formatted.length < Math.abs(len) )
          {
            len = Math.abs(len);
            formatted =  new Array((len-formatted.length)+1).join(" ") + formatted;
          }
        }
        else
        {
          if ( formatted.length < len )
          {
            formatted = formatted + new Array((len-formatted.length)+1).join(" ");
          }
        }
        msg= msg.replace('%*$'+str+'$', formatted);
      }
      else
        msg=  msg.replace('%*', args[x]);
    }
    msg = msg.color();
    if ( socket != undefined )
    {
      if ( chan && chan != null )
      {
        socket.emit(chan,msg);
      }
      else
        socket.emit("info",msg);
    }
    else
      Util.debug("Msg sent to undefined socket");
    return;
  },
  info: function (msg ) {
    if (typeof(data) === 'object' ) 
      msg = JSON.stringify(msg);
    console.log(msg );
  },
  encrypt: function(data, id) {
    var enc = "ENC!!"+ crypto.AES.encrypt(data,id);
    return enc;
  },
  decrypt: function(data,id) {
    data = data.substring(5);
    var dec = crypto.AES.decrypt(data,id);
    dec = dec.toString( crypto.enc.Utf8);
    return dec;
  }

};
