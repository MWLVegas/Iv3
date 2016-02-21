var userid ="";
var id = "";
var state = 0;

var socket = io();

var inputScroll = [];
var inputNum = 0;
var currInput;

function doInput() {

  var str = $('#m').val().trim();

  if ( str == "alias" )
  {
    $("#aliasWindow").dialog("open");
    $('#m').val('');

    return false;
  }

  if ( str.trim().length == 0 )
    return false;

  if (state == 1)
  {
    encrypt('pass',str);
  }
  else if ( state == 3 )
  {
    encrypt('newpass',str);
  }
  else
  {
    if ( !checkAlias(str) )
    {
      socket.emit('input',userid+"~"+str);
    }
    inputScroll.push(str);
    inputNum = inputScroll.length-1;
    currInput = inputNum+1;
  }

  $('#m').val('');
  return false;

}


function checkAlias( str )
{
  if ( aliases[str] )
  {
    socket.emit('input',userid+"~"+aliases[str]);
    return true;
  }

  return false;
}

$('form').submit(function() { 
  doInput();
  return false;
});

socket.on('announce', function(msg) { announce( msg.title, msg.data)  });
socket.on('disconnect',function(msg){ console.log(msg); state = -1; if ( msg == "transport close" ) { showmsg("You have been disconnected - The server has probably crashed. You will be reconnected once the server has returned.", "info"); } else { showmsg("You have disconnected from Ivalice.", "info"); socket.close()  } });
socket.on('clear',    function(msg) { resetInfo() });
socket.on('copyoversuccess', function(msg) { userid = msg; $("#announce").dialog("close"); });
socket.on('copyoverlogin', function(msg) { sendCopyover() });
socket.on('copyover', function(msg) { setCopyover() });
socket.on('state',    function(msg) { console.log("State: " + msg); state = msg; if ( state == 4 ) clearCopyover(); });
socket.on('id',       function(msg) { console.log("Session ID: " + msg); id = msg; });
socket.on('connect',  function(msg) { state = 0; resetInfo(); showmsg("Connected!","info"); });
socket.on('password', function(msg) { socket.emit('pass',encrypt(msg)); $("#m").get(0).type='password';});
socket.on('loggedin', function(msg) { var save = id; resetInfo(); id = save; console.log("Logged in: " + msg); userid = decrypt(msg); });
socket.on('login',    function(msg) { if ( msg.startsWith("Character not") ) { showmsg(msg,"info"); resetInfo(); return; } showmsg(msg, "info"); $("#m").get(0).type='password'; });
socket.on('newpass',  function(msg) { $("#m").get(0).type='password';});
socket.on('chat',     function(msg) { showmsg(timeStamp("[%H:%m:%s] ") + msg,"chat"); });
socket.on('info',     function(msg) { showmsg(msg,"info"); });
socket.on('error',    function(msg) { showmsg("<span id='error'>Error: "+msg+"</span>", "info"); });
socket.on('refresh',  function(msg) { alert("You have received a refresh request from the server. Reloading your page."); window.location.reload() });
function resetInfo() {
  userid = "";
  id = "";
  $("#m").get(0).type='text';
  console.log("Status reset");
}

function showmsg(data, channel) {
  if ( channel == undefined )
    channel = "info";

  $('<li><span style="color:white">'+data+'<span></li>').appendTo("#"+channel+"ul");//.hide().slideDown();
  scrollBottom(channel);

  if ( channel == 'chat' )
  {
    blinkTitle();
  }

  var input = "<DIV>"+data+"<DIV>";
  input = $(input).text();
  checkTrigger(input);

}

function checkTrigger(input) {
  return;
}

function scrollBottom(channel) {
  if(document.getElementById('scrollLock').checked) {
    $('#'+channel).css("border-color: #FF0000");
  }
  else
  {
    $('#'+channel).css("border-color: #000");
    $('#'+channel).delay(100).scrollTop($('#'+channel)[0].scrollHeight);
  }

}


function encrypt(channel, str) {
  if ( id == undefined )
  {
    showMsg("Error! ID is undefined for encryption! Report this to Raum!");
  }

  str = CryptoJS.AES.encrypt(str,id);
  socket.emit(channel, "ENC!!" + str.toString());
}

function decrypt(str) {
  var dec = CryptoJS.AES.decrypt(str.substr(5),id).toString();
  str = '';

  for (var i = 0; i < dec.length; i += 2)
    str += String.fromCharCode(parseInt(dec.substr(i, 2), 16));

  console.log(str);
  return str;
}


$( document ).ready(function() {
  popup("chat",  "Chat", "");
  popup("info",  "System","");


  loadAliases();
  loadTriggers();

  $('#m').keyup( function( event ) {
    if ( event.which != 38 && event.which != 40 ) 
      return;

    if ( event.which == 38 ) { // Up
      console.log("Up arrow");
      if ( currInput == 0 )
        return;

      currInput--;
      $('#m').val( inputScroll[currInput]);

    }
    else if ( event.which == 40) { // down
      console.log("Down arrow");
      if ( currInput >= inputNum )
      {
        $('#m').val( '');
        return;
      }
      currInput++; 
      $('#m').val( inputScroll[currInput]);

    }
  });

  showmsg("Ivalice v3.0 - Loaded");


});


function timeStamp(fmt) {

  var date = new Date();
  date.setTime( date.getTime() - (date.getTimezoneOffset()*60*1000));

  function pad(value) {
    return (value.toString().length < 2) ? '0' + value : value;
  }
  return fmt.replace(/%([a-zA-Z])/g, function (_, fmtCode) {
    switch (fmtCode) {
      case 'Y':
        return date.getUTCFullYear();
      case 'M':
        return pad(date.getUTCMonth() + 1);
      case 'd':
        return pad(date.getUTCDate());
      case 'H':
        return pad(date.getUTCHours());
      case 'm':
        return pad(date.getUTCMinutes());
      case 's':
        return pad(date.getUTCSeconds());
      default:
        throw new Error('Unsupported format code: ' + fmtCode);
    }
  });
}
function announce(title, msg ) {
  $( "#announce").attr("title",title);
  $( "#announce" ).dialog( {
    modal: true,
    position: { my: "center top-50", at: "top-50"},
    minWidth: 400,
    buttons: [
    {
      text: "Ok",
      click: function() {
        $( this ).dialog( "close" );
      }
    }
    ]
  });
  $("#announce").html("<div id='announce'>" + msg + "</div>");
}

var deftop = 0;
var defleft = 0;

function popup(name, title, msg ) {
  $("body").append("<div margin:10; padding:15; float:left; style='overflow-y:auto' id='"+name+"'><ul style='position:relative'; id='"+name+"ul'></ul></div>");


  $( "#"+name).attr("title",title);
  $( "#"+name ).dialog({
    closeOnEscape: false,
    autoOpen: false,
    modal: false,
    position: 'top',
    height: 'auto',
    width: 'auto',
    open: function( event, ui ) {
      $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
      var cookie = getCookie(name);
      if ( cookie == undefined )
      {
        cookie = { width: "400px", height: "400", left:deftop, top:defleft};
        deftop+=100; defleft+=100;

      }
      else
        cookie = JSON.parse(cookie);
      $(event.target).parent().css('position', 'fixed');
      $( "#"+name).dialog("option", "width",  ""+cookie.width);
      $( "#"+name).dialog("option", "height", ""+cookie.height);
      $(event.target).parent().css('top', cookie.top);
      $(event.target).parent().css('left', cookie.left);
    },
    resizeStop: function( event,ui ) {setCookie(event,ui, name) },
    dragStop: function( event, ui ) { setCookie(event,ui, name) },

  });

  $("#"+name).dialog('open');
}
function setCookie(event, ui, id) {

  $(event.target).parent().css('position', 'fixed');
  var h2 =$(event.target).parent().css('height');
  var w2 =$(event.target).parent().css('width');

  var width = $("#"+id).dialog("option", "width");
  var height = $("#"+id).dialog("option","height");
  var left =       $(event.target).parent().css('left');
  var top =  $(event.target).parent().css('top');
  console.log("top: " + top + " left: " + left );
  console.log("height: " + height + " width: " + width);
  console.log("id: " + id);
  var info = { top: top, left: left, height: height, width: width };
  document.cookie=id+"="+ JSON.stringify(info);

  $( "#"+id).dialog("option", "width",   Number(w2.substring(0,w2.length-2)));
  $( "#"+id).dialog("option", "height", Number(h2.substring(0,h2.length-2)));
  console.log("H2: " + h2);

}
function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1);
    if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
  }
  return undefined;
}

function sendCopyover() {
  var cookie = getCookie("copyover");
  console.log("Copyover login requested");

  if ( cookie == undefined )
  {
    console.log("No copyover info found");
    return;
  }
  console.log("Copyover info sent: " + JSON.parse(cookie));
  socket.emit("copyoverlogin", JSON.parse(cookie));

}

function setCopyover() {
  var cookie = { name: userid, id: id };
  document.cookie="copyover=" + JSON.stringify(cookie);
  console.log("Copyover Cookie written");
}

function clearCopyover() {
  document.cookie="copyover=''; expires=expires=Thu, 01 Jan 1970 00:00:01 GMT";
  console.log("Copyover Cookie Wiped");
}


var aliases = {};
var triggers = [];

function loadAliases() {
  $("body").append("<div id='aliasWindow'> <select id='aliasList' style='width:150px' size=15></select>" +
      "  <input id='aliasName'>" +
      "  <textarea id='aliasShow' rows=10>Select an Alias</textarea>" +
      "  <button id='saveAlias'>Save</button>" +
      "  <button id='newAlias'>New</button></div>");

  $( "#aliasWindow" ).dialog({
    autoOpen: false,
    open: function( event, ui ) {
      for ( var x in aliases )
      {
        $('#aliasList').append(x);
      }
    }
  });
  //  $("#aliasWindow").dialog("open");

  $('aliasWindow').dialog();
  var cookie = getCookie("aliases");
  if ( cookie != undefined && cookie.trim().length > 1)
  {
    console.log("Aliases loading: " + JSON.parse(cookie));
    cookie = JSON.parse(cookie);
    for ( var x in cookie )
    {
      aliases[x] = cookie[x];
    }
  }
  else
    console.log("No aliases");
  populateAliases();
  $('#aliasList').on('change', function() {
    var text = $('#aliasList').val();
    var name = $('#aliasList option:selected').text()

      $('#aliasShow').val(text);
    $('#aliasName').val(name)
      console.log("text should now be " + text);
  });

  $('#newAlias').on('click', function() {
    var name = "** New  " + Math.floor((Math.random() * 1000 + 1));
    aliases[name] = "New Alias";
    populateAliases();
    $('#aliasList option:contains(' + name + ')').prop({ selected: true });
        $('#aliasName').val(name);
        $('#aliasShow').val("New Alias");
        });
    $('#saveAlias').on('click', function() {
      var name2 = $('#aliasList option:selected').text()
        var name = "" + $('#aliasName').val();
      if (name2.trim() == 0)
        return;
      if (name != name2) {
        console.log("Deleting " + name2 + " to replace with " + name);
        delete aliases[name2];
      }
      aliases[name] = $("#aliasShow").val();
      populateAliases();
      //console.log(aliases);
      $('#aliasList option:contains(' + name + ')').prop({        selected: true      });
          saveAliases();
          });
      };

      function saveAliases() {
        console.log("Saving aliases: " + aliases);

for ( var x in aliases ) {
  document.cookie="aliases="+ JSON.stringify(aliases);
//Stuff
}
}
      function populateAliases() {
        //aliases = aliases.sort();
        $("#aliasList").empty();

        for (var x in aliases) {
          $("#aliasList").append('<option id=' + x + ' value="' + aliases[x] + ' ">' + x + '</option>');

        }

      }

function loadTriggers() {
  var cookie = getCookie("triggers");

  if ( cookie != undefined )
  {

    cookie = JSON.parse(cookie);
    for ( var x in cookie )
    {
      triggers[x] = cookie[x];
    }
  }
  showmsg("Triggers loaded.");

}

var title = top.document.title;
var titleblink;
var focused = true;
var blinking = false;

function blinkTitle() {
  if ( focused )
  {
    stopBlinking();
    return;
  }

  if ( blinking )
    return;

  blinking = true;
  titleblink = setInterval( function() {
    if ( focused ){
      stopBlinking();
      return;
    }
    if ( top.document.title == title )
    {
      top.document.title = "* " + title;
    }
    else
    {
      top.document.title = title;

    }
  }, 1000);


}

function stopBlinking() {
  clearInterval(titleblink);
  blinking = false;
  top.document.title = title;
}

$(window).bind('focus', function() {                
  if (!focused ) {
    focused = true;
  }
});
$(window).bind('blur', function() {
  if ( focused ) {
    focused = false;    
  }
} );
