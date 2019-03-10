var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var counter = 0;
var name = "User";
var uniqueName = '';
var currentTime, timestamp;
var hours;
var minutes;
var userList = new Array();
var chatLog = new Array();
var socketArray = new Array();
var numberOfUsers= 0;
var reqCookies;
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
 

});



io.on('connection', function(socket){
	var cookie = socket.client.request.headers.cookie;
	console.log('Cookie = ' + cookie);

	if(typeof cookie == 'undefined'){
		counter++;
		uniqueName = name+counter;
		userList.push(uniqueName);
		socketArray.push(socket.id);
		numberOfUsers++;
		var newUser = uniqueName + " connected"
		io.emit("chat message", newUser);
		socket.emit('uniqueName', uniqueName);
		socket.emit('chatUpdate', chatLog);
 		io.emit('userUpdate', userList);
 		
	}
	
	else{
		
		cookieArray = cookie.split("; ")
		if (cookieArray[1].includes("nickName")){
			cookiePair = cookieArray[1].split("=");

		}
		else{
			cookiePair = cookieArray[0].split("=");
		}
		cookieValue = cookiePair[1];
		console.log("Cookerpair[0] = " + cookiePair[0]);
		console.log("Cookerpair[1] = " + cookiePair[1]);

		if(cookiePair[0] == "nickName"){
			console.log("Cookie value extracted = "+cookieValue);
			uniqueName = cookieValue;
			var reconn = uniqueName + " reconnected";
			io.emit("chat message", reconn);
			socket.emit('uniqueName', uniqueName);
			socket.emit('chatUpdate', chatLog);
 			numberOfUsers++;
 			userList.push(uniqueName);
			socketArray.push(socket.id);
 			io.emit('userUpdate', userList);
 		}
	}
	currentTime = new Date();
	hours = currentTime.getHours();
	minutes = currentTime.getMinutes();
	
	if (minutes < 10){
		timestamp = hours + ':' + '0' + minutes;
	}
	else{
		timestamp = hours + ':' + minutes;
	}
	
	
	console.log(uniqueName + "socket ID =" + socket.id);

	/*
	for (var i = userList.length - 1; i >= 0; i--) {
		console.log(userList[i]);
	}
	for (var i = chatLog.length - 1; i >= 0; i--) {
		console.log(chatLog[i]);
	}
	*/
 	socket.on('chat message', function(msg, nickcolor){
   		console.log("Message:" + msg);
    	var splicedMessage = msg.split(" ");
    	var actualMessage = splicedMessage[1];
    	var userId = splicedMessage[0];
    	var nickName = userId.slice(0, userId.length -1);
    	console.log("UNIQUE NAME = " + nickName);
    	if (actualMessage.startsWith("/nick") && !actualMessage.startsWith("/nickcolor")){
    		var index = userList.indexOf(nickName);
    		console.log(nickName + "'s index is " + index );
    		var newNickname = splicedMessage[2];
    		if(userList.includes(newNickname)){
    			var err = "Error: Nickname already used, please enter a unique nickname";
    			io.emit('chat message', err);
    		}
    		else {
    		nickName = newNickname;
    		console.log(nickName + "'s index is " + index );
    		userList[index] = nickName;
    		io.emit('userUpdate', userList);
    		socket.emit('uniqueName', nickName);
    		}
    	}
    	if (actualMessage.startsWith("/nickcolor")){
    		var color = splicedMessage[2];
    		console.log(color);
    		if (color.length != 6){
    			var err = "Error: Not a valid hexidecimal color number, please try again";
    			io.emit('chat message', err);
    		}
    		else{
    			var color = '#'+color;
    			socket.emit('update color', color);
    		}
    		}
    	console.log("actualMessage: " + actualMessage);
    	msg= timestamp + ' ' + msg;
    	chatLog.push(msg);
    	io.emit('chat message', msg, nickcolor);
	});

 	
    socket.on('disconnect', function(){
   
    	var index = socketArray.indexOf(socket.id);
    	console.log("user index = "+ index);
    	console.log("user " +userList[index] + " disconnected");
    	numberOfUsers--;
    	if (index > -1) {
  			var announce = "User " + userList[index] + " disconnected from the chat room"
  			 io.emit('chat message', announce);
  			userList.splice(index, 1);
  			socketArray.splice(index,1);
  			io.emit('userUpdate', userList);			
    	}
    });
    
    

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});