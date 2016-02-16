var Util = require('./util.js');


var doWho = function(socket,msg) {

  Util.msg(socket, "<br />##3C3======================", "info");
  var count = 0;
  for ( var x in player )
  {
    if ( player[x].state == 4)
    {
      count++;
      var str = "[%*$-3$] %*".toString();
      var arr = [ player[x].level,player[x].name ];
      Util.msg(socket, str, "info", arr );
    }
  }
  Util.msg(socket, "<br />##3C3======================", "info");
  Util.msg(socket, "Players Online: " + count);

};

module.exports.doWho = doWho;

