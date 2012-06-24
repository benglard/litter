/*
Copyright (C) 2010 Pierre St Juste <ptony82@ufl.edu>, University of Florida

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

$(document).ready(init);

function init() {
  document.title = "Litter - Microblogging for the LAN";
  loadPage();
  loadHeader();
  loadPost();
  createTable();
  getState();
  window.setInterval(getState, 15000);
}

function loadPage() {
  $("<div/>", {'id' : 'wrapper'}).appendTo("body");
  $("<div/>", {'id' : 'header'}).appendTo("#wrapper");
  $("<div/>", {'id' : 'subheader'}).appendTo("#header");
  $("<div/>", {'id' : 'maindiv'}).appendTo("#wrapper");
  $("<div/>", {'id' : 'postdiv'}).appendTo("#maindiv");
  //$("<div/>", {'id' : 'inputdiv'}).appendTo("#maindiv");
  $("<div/>", {'id' : 'resultsdiv'}).appendTo("#maindiv");
}

function loadHeader() {
  $("<h1/>", {text : 'Litter - Microblog for the LAN'}).appendTo("#subheader");
  var menu = $("<ul/>").appendTo("#subheader");
  menu.append($("<li/>", {text : 'Refresh', click : getState}));
  var search_bar = $("<textarea/>", {"name" : "search_bar", "cols" : "30", "rows" : 1,
  	  id : "search", text : "Search by username or keyword"}).appendTo("#subheader");
  search_bar.css({"resize" : "none"});
  $("<button/>", {text : "Search", "height" : "50px", click : search}).appendTo("#subheader"); 
}

function doNothing() {}

function search() {
  if ($("#search").val() != "") {
	  $("#postdiv").slideUp();
	  $("#resultsdiv").html("");
	  var ob = { "m" : "get" , "limit" : 2147483647} //max int in javascript
	  $.ajax({type: "POST", url: "/api", dataType: 'json', 
		data : {'json' : JSON.stringify(ob)}, success: processSearch});
	}
}

function processSearch(state) {
  posts = state['posts'];
  var query = $("#search").val();
  createTable();
  var res_counter = 0
  for (var i = posts.length-1; i >= 0; i--) {
    var result = {}
    result['msg'] = posts[i][0]
    result['uid'] = posts[i][1]
    result['txtime'] = posts[i][2]
    result['rxtime'] = posts[i][3]
    result['postid'] = posts[i][4]
    result['perms'] = posts[i][5]
    result['hashid'] = posts[i][6]
    if (result.msg.indexOf(query) != -1 || result.uid.indexOf(query) != -1) { 
    	addResult(result, "search");
    	res_counter += 1
    }
  }
  if (res_counter == 0) 
  	alert("No messages with \"" + query + "\" found.")
}

function loadPost() {
  var q = $("<h1/>", {id : "news_area", text : "What's new?"}).appendTo("#postdiv");
  q.css({"color" : "gray", "text-align" : "left"});
  var tarea = $("<textarea/>", {"name" : "post", "cols" : "100", "rows" : "3", 
      id : "txt"}).appendTo("#postdiv");
  $("<button/>", {text : "Everyone", click : doEverybodyPost}
      ).appendTo("#postdiv");
  $("<button/>", {text : "2-hop Friends", click : doFriendPost}
      ).appendTo("#postdiv");
  $("<button/>", {text : "1-hop Friends", click : doFriendPost}
      ).appendTo("#postdiv");
  var par = $("<p/>", { id : "countid", text : '140 characters left'}
      ).appendTo("#postdiv");
  par.css({"color" : "black", "text-align" : "left", "width" : "600px"});
  par.css({"font-size" : "20px"});
	
  tarea.keypress(messageCount);
  tarea.mouseup(messageCount);
}

function messageCount() {
  var msg = $(this).val();
  var count = 140 - msg.length;
  var elem = $("#countid").html(count + " characters left");
  if (msg.length > 139) {
    elem.css({"color" : "#FF0000"});
  }
  else {
    elem.css({"color" : "black"});
  }
}

function loadResults(state) {
  $("#news_area").html("What's new, " + state[0][1] + "?");

  for (var i = state.length-1; i >= 0; i--) {
    var result = {}
    result['msg'] = state[i][0]
    result['uid'] = state[i][1]
    result['txtime'] = state[i][2]
    result['rxtime'] = state[i][3]
    result['postid'] = state[i][4]
    result['perms'] = state[i][5]
    result['hashid'] = state[i][6]
    addResult(result, "N");
  }
}

function createTable() {
  var table = $("<table/>").appendTo("#resultsdiv");
  var row = $("<tr/>", { id : 'firstrow'}).appendTo(table);

  var imgcol = $("<td/>");
  var title = "";
  var infocol = $("<td/>", { text: title, 'width' : '100%', 
    'class' : 'table_title'});
  var ratingcol = $("<td/>");
  imgcol.appendTo(row);
  infocol.appendTo(row);
  ratingcol.appendTo(row);
}

function addResult(result, reason) {
  // we check to see if we already have this in our table
  if ($("body").data(result.hashid) != null && reason != "search") {
    return;
  }

  // time is returned in seconds, needs to be in milliseconds
  var date = new Date(result.txtime * 1000);

  var row = $("<tr/>");
  $("#firstrow").after(row);
  var imgcol = $("<td/>", { 'valign' : 'top'});
  var infocol = $("<td/>", { 'width': '100%'});
  var ratingcol = $("<td/>");
  imgcol.appendTo(row);
  infocol.appendTo(row);
  ratingcol.appendTo(row);

  var md5_uid = hex_md5(result.uid);

  img_src = "http://gravatar.com/avatar/" + md5_uid + "?d=identicon"
  $("<img/>", {'src' : img_src, 'width' : '40px', 
    'height' : '40px'}).appendTo(imgcol);


  infocol.append($("<p/>", {text: result.uid, 'class' : 'name',
    'id' : result.uid}));
    
  //Clicking on a username brings up most recent most by that user
  //by doing a search where keyword = uid
  $('p.name').click(function() {
    $("#search").html(result.uid);
    search();
  });
  
  var msg;
  
  var query = $("#search").val()
  if (query != "Search by username or keyword" && query != "") 
  	msg = updateUrl(result.msg, query);
  else
	msg = updateUrl(result.msg, "");
	
  infocol.append($("<p/>", {'class' : 'msg'}).html(msg));
  infocol.append($("<p/>", { text: date.toString(), 'class' : 'time'}));
  ratingcol.append($("<span/>", {text: '','class': 'rating'}));

  // this is a patch so that we don't have duplicate messages in browser
  // but this may cause memory leak, not too sure at the moment
  $("body").data(result.hashid, result);
}

function updateUrl(msg, query) {
  var strArray = msg.split(" ");
  for (var i=0; i < strArray.length; i++) {
    if (strArray[i].search("^http://") != -1) {
      strArray[i] = "<a target=\"_blank\" href=\"" + strArray[i] + "\">" + 
          strArray[i] + "</a>";
    }
    else if (strArray[i].search("^www.") != -1) {
      strArray[i] = "<a target=\"_blank\" href=\"http://" + strArray[i] + "\">" + 
          strArray[i] + "</a>";
    }
    else if (strArray[i].indexOf(".com") != -1) {
      strArray[i] = "<a target=\"_blank\" href=\"http://" + strArray[i] + "\">" + 
          strArray[i] + "</a>";
    }
    else if (strArray[i].indexOf(".net") != -1) {
      strArray[i] = "<a target=\"_blank\" href=\"http://" + strArray[i] + "\">" + 
          strArray[i] + "</a>";
    }
    else if (strArray[i].indexOf(".edu") != -1) {
      strArray[i] = "<a target=\"_blank\" href=\"http://" + strArray[i] + "\">" + 
          strArray[i] + "</a>";
    }
    else if (strArray[i].indexOf(".org") != -1) {
      strArray[i] = "<a target=\"_blank\" href=\"http://" + strArray[i] + "\">" + 
          strArray[i] + "</a>";
    }
    else if (strArray[i].indexOf(".gov") != -1) {
      strArray[i] = "<a target=\"_blank\" href=\"http://" + strArray[i] + "\">" + 
          strArray[i] + "</a>";
    }
    else if (strArray[i].indexOf("@") != -1) {
      strArray[i] = "<a target=\"_blank\" href=\"http://" + strArray[i] + "\">" + 
          strArray[i] + "</a>";
    }
    else if (query != "" && strArray[i].indexOf(query) != -1) {
    	strArray[i] = "<b><i>" + strArray[i] + "</i></b>";
    }
  }
  var result = strArray.join(" ");
  return result;
}

function getState() {
  var ob = { "m" : "get", "limit" : 10 }
  $.ajax({type: "POST", url: "/api", dataType: 'json', 
    data : {'json' : JSON.stringify(ob)}, success: processState});
}

function doPost(perms) {
  var msg = $("textarea#txt").val();
  if (msg.length > 140) {
    alert("Message is longer than 140 characters");
    return;
  }
  var ob = {"m":"gen_push","posts": [ { 'msg':msg,'perms':perms}] };
  $("textarea#txt").val('');
  $.ajax({type: "POST", url: "/api", dataType: 'json', 
          data : {'json' : JSON.stringify(ob)} ,
          success: getState});
  var elem = $("#countid").html("140 characters left");
}

function doFriendPost() {
  doPost(1);
}

function doEverybodyPost() {
  doPost(2);
}

function processState(state) {
  loadResults(state['posts']);
}
