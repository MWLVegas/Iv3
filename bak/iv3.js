var userid ="";
var id = "";
var state = 0;

var socket = io();
var fontsize = 100;
var inputScroll = [];
var inputNum = 0;
var currInput;
var freeze = false;

function doFreeze() {
  if ( freeze ) {
    freeze = false;
    $("#freezeText").html("Freeze");

  }
  else
  {
    freeze = true;
    $("#freezeText").html("Unfreeze");
  }

  console.log("Frozen: " + freeze);
}

function doInput() {

  var str = $('#m').val().trim();

  if ( str.trim().length == 0 )
    return false;

  if ( !checkAlias(str) )
  {
    socket.emit('input',userid+"~"+str);
  }
  inputScroll.push(str);
  inputNum = inputScroll.length-1;
  currInput = inputNum+1;

  if ( settings.savecommand == true )
  {
    $('#m').select();
  }
  else
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


socket.on('pong',     function() { updateLatency() } );
socket.on('loginmsg', function(msg) { loginMsg(msg); wait(false); console.log("Login Msg: " + msg);});
socket.on('barUpdate',function(msg){ updateBars(msg);  });
socket.on('announce', function(msg) { announce( msg.title, msg.data);  });
socket.on('disco',    function(msg){ handleDisconnect(msg); });
socket.on('clear',    function(msg) { resetInfo() });
socket.on('copyoversuccess', function(msg) { loginSuccess(msg) } );
socket.on('copyoverlogin', function(msg) { sendCopyover() });
socket.on('copyover', function(msg) { setCopyover() });
socket.on('state',    function(msg) { console.log("State: " + msg); state = msg; if ( state == 4 ) clearCopyover(); });
socket.on('id',       function(msg) { console.log("Session ID: " + msg); id = msg; });
socket.on('connect',  function(msg) { state = 0; resetInfo(); showmsg("Connected!","info"); showmsg("<hr>","chat") });
socket.on('password', function(msg) { socket.emit('pass',encrypt(msg)); $("#m").get(0).type='password';});
socket.on('loggedin', function(msg) { var save = id; resetInfo(); id = save; console.log("Logged in: " + msg); userid = decrypt(msg); });
socket.on('login',    function(msg) { if ( msg.startsWith("Character not") ) { showmsg(msg,"info"); resetInfo(); return; } showmsg(msg, "info"); $("#m").get(0).type='password'; });
socket.on('newpass',  function(msg) { $("#m").get(0).type='password';});
socket.on('chat',     function(msg) { showmsg(timeStamp(settings.timestamp +" ") + msg,"chat"); });
socket.on('info',     function(msg) { showmsg(msg,"info"); });
socket.on('error',    function(msg) { showmsg("<span id='error'>Error: "+msg+"</span>", "info"); });
socket.on('refresh',  function(msg) { alert("You have received a refresh request from the server. Reloading your page."); window.location.reload() });

function loginSuccess(msg) {
  userid = msg; 
  $("#announce").dialog("close"); 
  wait(false);
  $("#login").dialog("close");

}

function resetInfo() {
  userid = "";
  id = "";
  $("#m").get(0).type='text';
  updateBars("0:0:0:0");
  state = -1;
  wait(false);
}

function showmsg(data, channel) {
  if ( channel == undefined )
    channel = "info";

  $('<li><span style="font-size: '+fontsize+'%; color:white">'+data+'<span></li>').appendTo("#"+channel+"ul");//.hide().slideDown();
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
  if ( freeze )
  {
    $('#'+channel).css("border-color: #FF0000");
    return;
  }
  else
  {
    $('#'+channel).css("border-color: #000");
    $('#'+channel).delay(100).scrollTop($('#'+channel)[0].scrollHeight);
    setTimeout( function() {     $('#'+channel).delay(250).scrollTop($('#'+channel)[0].scrollHeight); }, 250);

    if ( $('#'+channel).scrollHeight -  $('#'+channel).scrollTop() ==  $('#'+channel).outerHeight()) {
    }
    //    else
    //      scrollBottom(channel);
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

  //  loadLogin();

  loadAliases();
  loadTriggers();
  loadOtherSettings();

  showmsg("Iv 3 - Loaded");

  $('#m').keydown( function( event ) {
    if ( settings.usekeypad ) {
      switch ( event.which ) {
        default: break;
        case 104:     socket.emit('input',userid+"~north"); return false;
        case 102:     socket.emit('input',userid+"~east"); return false;
        case 98:      socket.emit('input',userid+"~south"); return false;
        case 100:     socket.emit('input',userid+"~west"); return false ;
        case 105:     socket.emit('input',userid+"~up"); return false;
        case 99:      socket.emit('input',userid+"~down"); return false;
        case 101:     socket.emit('input',userid+"~look"); return false;
     }

    }

    if ( event.which != 38 && event.which != 40 ) 
      return;

    if ( event.which == 38 ) { // Up
//      console.log("Up arrow");
      if ( currInput == 0 )
        return;

      currInput--;
      $('#m').val( inputScroll[currInput]);

    }
    else if ( event.which == 40) { // down
//      console.log("Down arrow");
      if ( currInput >= inputNum )
      {
        $('#m').val( '');
        return;
      }
      currInput++; 
      $('#m').val( inputScroll[currInput]);

    }
  });

  $('#loginPass').on("keypress", function(event) {
    if (event.keyCode == 13) {
      checkLogin();
    }
  });


  $('#newCharacter').click(function() {
    if ( !newChar ) {
      $('#newCharacter').html("<img src='http://ivalicemud.com/iv3-image/existing.png'>");
      $('#emailDiv').slideDown();//w().animate(1000);
      $('#loginButton').button('option', 'label', 'Create Character');
      newChar = true;
    } else {
      $('#newCharacter').html("<img src='http://ivalicemud.com/iv3-image/newchar2.png'>");
      $('#emailDiv').slideUp();//ss("display", "none").animate(850);
      $('#loginButton').button('option', 'label', 'Login');
      newChar = false;
    }

  });

});

var settings = {};

function loadOtherSettings() {
  // Timestamp
  // Save Command Line
  // Blink

  settings["timestamp"] = "[%H:%m:%s]";
  settings["blink"] = true;
  settings["usekeypad"] = true;
  settings["savecommand"] = false;
  settings["healthcolor"] = "d33a49";
  settings["manacolor"] = "3a49d3";
  settings["fontsize"] = 100;
  settings["font"] = "";

  var cookie = getCookie("settings");
  setTimeout( function() { 

  if ( cookie != undefined ) // Load old settings now
  {
    var cook = JSON.parse(cookie);
//    console.log(cookie);
    for ( var x in cook )
    {
      settings[x.toString()] = cook[x];
//      console.log("Setting " + x.toString() + " to " + cook[x]);
      //          settings = JSON.parse(cookie);
    }
  }
  }, 1000);

  $("#settingsWindow").dialog({
    resizable: false,
    dialogClass: 'settingsWindow',
    minWidth: 600,
    title: "Iv3 Settings",
    autoOpen: false,
    dialogClass: "settingsWindow",
    close: function(event, ui) {
      saveSettings();
    },
    create: function(event, ui) {
      var widget = $(this).dialog("widget");
      $(".ui-dialog-titlebar-close span", widget)
        .removeClass("ui-icon-closethick")
        .addClass("ui-icon-minusthick");

      $("#fontsize").slider({
        max:200,
        min:50,
        value:100,
        slide: function( event, ui ) {
          fontsize = $("#fontsize").slider("option","value")
            $("#font-label").html("<span style='font-size:"+fontsize+"%'>Font Size: " + fontsize + "%</span>");
        },
      });
    },
    open: function(event, ui) {
      populateSettings();
    }
  });

  setTimeout( function() { updateSettings(); }, 1100 );
  showmsg("Settings loaded", "info");
}

function populateSettings() {
  $('input', $('#settingsHolder')).each(function () {
    if ( $(this).attr("type") == "checkbox" )
      $(this).prop("checked",settings[this.id]);
    else  
    this.value = settings[this.id.toString()];
  });
  $("#fontsize").slider("option","value", settings.fontsize);
  $("#font-label").html("<span style='font-size:"+fontsize+"%'>Font Size: " + fontsize + "%</span>");

  console.log("Settings populated");
}

function saveSettings() {
  $('input', $('#settingsHolder')).each(function ()  {
     if ( $(this).attr("type") == "checkbox" )
           settings[this.id] = $(this).prop("checked");
     else
    settings[this.id] = this.value;
  });
  settings['fontsize'] = fontsize;
  document.cookie="settings="+ JSON.stringify(settings)+ "; expires=Thu, 01 Jan 2050 00:00:01 GMT";
  updateSettings();
  console.log("Settings saved: " + JSON.stringify(settings));
}

function updateSettings() {
  $(".health-bar-fluid").css({"background":"#"+ settings.healthcolor});
  $(".mana-bar-fluid").css({"background":"#" + settings.manacolor});
  fontsize = settings.fontsize;

  $('.systemWindow', $('body')).each( function() {

    $('li', this).each(function () {
    $(this).css("font-size",fontsize +"%");
  });
  });
  console.log("Settings updated");

}


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
      case 'D':
      case 'd':
        return pad(date.getUTCDate());
      case 'H':
        return pad(date.getUTCHours());
      case 'h':
        var num = date.getUTCHours();
        if ( num > 12 ) hours -= 12;
        if ( num == 0 ) hours = 12;
        return pad(num);
      case 'p': if ( date.getUTCHours() < 12 ) 
                  return 'am';
        else 
          return 'pm';
      case 'm':
        return pad(date.getUTCMinutes());
      case 'S':
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
    dialogClass: "announce",

    resizable: false,
    position: { my: "center top-50", at: "top-50"},
    minWidth: 400,
    close: function(ui, event) {
      loadLogin();
    },
    buttons: [
    {
      text: "Ok",
      click: function() {
        $( this ).dialog( "close" );
        loadLogin();
      }
    }
    ]
  });
  $("#announce").html("<div id='announcement'>" + msg + "</div>");
}

var deftop = 0;
var defleft = 0;

function popup(name, title, msg ) {
  $("body").append("<div id='"+name+"'><ul style='background:#000; width:100%; position:relative'; id='"+name+"ul'></ul></div>");


  $( "#"+name).attr("title",title);
  $( "#"+name ).dialog({
    dialogClass: "systemWindow",
    closeOnEscape: false,
    autoOpen: false,
    modal: false,
    position: 'top',
    height: 'auto',
    width: '100%',
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
      $(event.target).parent().css('background', '#000');
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
  //  console.log("top: " + top + " left: " + left );
  //  console.log("height: " + height + " width: " + width);
  //  console.log("id: " + id);
  var info = { top: top, left: left, height: height, width: width };
  document.cookie=id+"="+ JSON.stringify(info)+ "; expires=Thu, 01 Jan 2050 00:00:01 GMT";

  $( "#"+id).dialog("option", "width",   Number(w2.substring(0,w2.length-2)));
  $( "#"+id).dialog("option", "height", Number(h2.substring(0,h2.length-2)));
  //  console.log("H2: " + h2);

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
  //  console.log("Copyover login requested");

  if ( cookie == undefined )
  {
    //    console.log("No copyover info found");
    socket.emit("nocopyover","");
    return;
  }
  //  console.log("Copyover info sent: " + JSON.parse(cookie));
  socket.emit("copyoverlogin", JSON.parse(cookie));

}

function setCopyover() {
  var cookie = { name: userid, id: id };
  document.cookie="copyover=" + JSON.stringify(cookie)+ "; expires=expires=Thu, 01 Jan 2050 00:00:01 GMT";
  console.log("Copyover Cookie written");
}

function clearCopyover() {
  document.cookie="copyover=''; expires=expires=Thu, 01 Jan 1970 00:00:01 GMT";
  console.log("Copyover Cookie Wiped");
}


var aliases = {};
var triggers = [];

function loadAliases() {
  $("body").append("<div id='aliasWindow'> <div style='float:left;'> <select id='aliasList' style='width:150px' resize:false; size=15></select> " +
      "  <br /> <button id='saveAlias'>Save</button> <button id='newAlias'>New</button></div>" +
      "  <div style='float:left;'> <input style='width:100%;' id='aliasName'><br />" +
      "  <textarea style='resize:none;' id='aliasShow' rows=15 cols=30 placeholder='Enter your long command text. Seperate multiple commands with ;'>Select an Alias</textarea>" +
      " </div></div>");

  $( "#aliasWindow" ).dialog({
    resizable: false,
    minWidth: 500,
    title: "Alias Editor",
    autoOpen: false,
    dialogClass: "aliasWindow",
    open: function( event, ui ) {
      for ( var x in aliases )
      {
        $('#aliasList').append(x);
      }
    }
  });
  //  $("#aliasWindow").dialog("open");

  //  $('aliasWindow').dialog();
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

      showmsg("Aliases loaded.", "info");
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

  if ( settings.blink == false )
    return;

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

var bars = {};
function updatebar(bar, cur, max) {
  var num = Math.round(Number(cur));

  if ( bars[bar] != undefined )
  {
    if ( bars[bar] == num )
      return;
  }

  bars[bar] = num;

  num = Math.round( (cur/max) * 100 );

  $("."+bar+"-bar-fluid").css('overflow', 'hidden').animate( {
    width:num+"%" }, 1000);

  var info = bar.charAt(0).toUpperCase() + bar.toLowerCase().slice(1) + "\: " + cur + "\/" + max;
  $("#"+bar).attr('title', info);

}

function updateBars(data) {
  var info = data.split(":");

  var hp = Number(info[0]);
  var maxhp = Number(info[1]);
  var mana = Number(info[2]);
  var maxmana = Number(info[3]);

  updatebar("health", hp, maxhp );
  updatebar("mana", mana, maxmana );
}

function handleDisconnect(msg) {
  resetInfo(); 
  console.log(msg); 
  if ( msg == "transport close" ) 
  {
    showmsg("You have been disconnected - The server has probably crashed. You will be reconnected once the server has returned.", "info"); 
  } 
  else { 
    showmsg("You have disconnected from Ivalice.", "info"); 
    socket.close()  
  } 
}

var newChar = false;
wait(false);

function checkLogin() {
  var login;
  loginMsg("");
  wait(true);
  var name = "" + $("#loginName").val().trim();
  var pass = "" + $("#loginPass").val().trim();
  if (name == undefined || name.length == 0) {
    loginMsg("Enter your character name.");
    wait(false);
    return;
  }

  if (pass == undefined || pass.length == 0) {
    loginMsg("Enter your password.");
    wait(false);
    return;
  }
  if (!newChar) // Login
  {
    login = name + "::" + pass;
    socket.emit("formlogin", login);

  } else if (newChar) { // New Char
    var email = $("#loginEmail").val();
    if (!validEmail(email)) {
      loginMsg("Invalid email address.", "#F00");
      wait(false);
      return;
    }
    login = name + "::" + pass + "::" + email;
    socket.emit("formcreate", login);
  }
  // loginMsg(login);
}

function validEmail(email) {

  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  console.log("Checking " + email);
  var test = regex.test(email);
  console.log("Returns " + test);
  return test;
}

function loginMsg(msg, color) {
  if (msg == "")
    $('#messages').css("padding-top", "0px");
  else
    $('#messages').css("padding-top", "45px");

  $("#messages").html("<span style='color:" + color + "'>" + msg + "</span>");
}

function wait(show) {

  if (show) {
    $('#loaddiv').css("padding-top", ($(document).height() / 2) + "px");
    $('#wait').show();
    $('#loginButton').button('disable');
  } else {
    $('#wait').hide();
    $('#loader').css("display", "none");

    $('#loginButton').button('enable');
  }
}

function loadLogin() {
  console.log("Loading login");

  $("#login").dialog({
    closeOnEscape: false,
    dialogClass: 'logonWindow',

    resizable: false,
    minWidth: 400,
    modal: true,
    close: function(ui, event) {
      $("#m").focus();
    },
    buttons: [{
      id: 'loginButton',
      text: "Login",
      click: function() {
        checkLogin();
      }

    }]
  });
}

var startTime;

var latency = setInterval(function() {
  startTime = Date.now();
  socket.emit('ping');
}, 30000);

var latency;

function updateLatency() {
  latency = Date.now() - startTime;   
  //  console.log(latency); 
}

