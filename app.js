var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
var bodyParser = require('body-parser');
var path = require("path");  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "getthepair.cr1a92pwyyql.us-east-2.rds.amazonaws.com",
  user: "toolantu",
  password: "789system",
  database:"getthepair"
});


app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

server.listen(8080);

process.env.PWD = process.cwd()
	
// Then
app.use(express.static(process.env.PWD + '/img'));
app.use(express.static(path.join(__dirname, 'public')));

// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var quizrooms = [];
var playerScorecard = [];
var rooms = [];
var onlineplayers = [];
var players = [];
var senders=[];
var roomno=1;
var playerlimit=4;
var imgvalue=0;
var k=0;

io.sockets.on('connection', function (socket) {
		
	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		
		if(rooms.length > playerlimit)
		  {	  
			roomno++;
			playerlimit=playerlimit+4;
		  }
		 
		 socket.username = username.Playerusername;
			player={
				"player" : username.Playerusername,
				"PlayerSocketId" : username.PlayerSocketId
			}
			onlineplayers.push(player);
     		usernames[username] = username.PlayerSocketId;
			socket.broadcast.emit('onlineplayers', onlineplayers);
	});
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});
	
	socket.on('create', function(room) {
		var playerlimit = room.roomlimit;
		console.log("creating room...");
		
		con.connect(function(err) {
		  if (err) throw err;
		  console.log("Connected!");
		  con.query("SELECT * FROM pairtype WHERE ptype_player_count="+playerlimit+" order by rand() limit 1", function (err, row, fields) {
			if (err) throw err;
					imgvalue=row[0].ptype_set;
					room['imgvalue'] = imgvalue;
					rooms.push(room);;
					socket.emit('updaterooms', room);
					socket.broadcast.emit('updaterooms', room);
					console.log('rooms created :'+ room.roomname);
					console.log('rooms created with img:'+ room.imgvalue);
			
			});
		});
	});
	
	socket.on('switchRoom', function(newroom) {
        var oldroom;
        oldroom = socket.room;
        socket.leave(socket.room);
        socket.join(newroom.roomname);
		console.log('joined room : ' + newroom.roomname);
		console.log('joined room limit : ' + newroom.roomlimit);
		
        socket.broadcast.to(oldroom).emit('updatechat', 'SERVER', socket.username + ' has left this room');
        socket.room = newroom.roomname;
        
		    socket.username = newroom.Playerusername;
			
			onlineplayers = onlineplayers.filter(function(item){ 
				return (item.PlayerSocketId !== socket.id); 
			});
			
			player={
				"player" : newroom.Playerusername,
				"room" : newroom.roomname,
				"PlayerSocketId" : newroom.PlayerSocketId
			}
			players.push(player);
			
			console.log(player);
			console.log(newroom.Playerusername+' -> '+socket.room);
		// add the client's username to the global list
		//usernames[username] = newroom.PlayerSocketId;
	
		  //Send this event to everyone in the room.
		io.sockets.in(socket.room).emit('connectToRoom', "You are in room no. "+newroom.roomname);
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has connected to this room');
		socket.broadcast.to(socket.room).emit('updateplayers', players, newroom);
		socket.broadcast.to(socket.room).emit('onlineplayers', onlineplayers);
		socket.emit('onlineplayers', onlineplayers);
		socket.emit('updateplayers', players, newroom);
		socket.emit('showgamearea');
	});
	
	socket.on('joinRoom', function(invitedroom) {
        var oldroom;
		var newroom ;
        oldroom = socket.room;
        socket.leave(socket.room);
        socket.join(invitedroom.roomname);
		console.log('joined room : ' + invitedroom.roomname);
		
            socket.room = invitedroom.roomname;
        
		    socket.username = invitedroom.Playerusername;
			
			onlineplayers = onlineplayers.filter(function(item){ 
				return (item.PlayerSocketId !== socket.id); 
			});
			
			rooms.filter(function(item){ 
				if(item.roomname == invitedroom.roomname){
					newroom={
					    roomname:item.roomname,
						roomlimit:item.roomlimit,
						imgvalue : item.imgvalue, 
						roompassword:item.roompassword
					}
				}
			});
			
			player={
				"player" : invitedroom.Playerusername,
				"room" : invitedroom.roomname,
				"PlayerSocketId" : invitedroom.PlayerSocketId
			}
			players.push(player);
			console.log(player);
			console.log(invitedroom.Playerusername+' -> '+newroom.roomname+'-->'+newroom.imgvalue);
		// add the client's username to the global list
		//usernames[username] = newroom.PlayerSocketId;
	
		//Send this event to everyone in the room.
		io.sockets.in(socket.room).emit('connectToRoom', "You are in room no. "+invitedroom.roomname);
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has connected to this room');
		socket.broadcast.to(socket.room).emit('updateplayers', players, newroom);
		socket.broadcast.to(socket.room).emit('onlineplayers', onlineplayers);
		socket.emit('onlineplayers', onlineplayers);
		socket.emit('updateplayers', players, newroom);
		socket.emit('showgamearea');
	});
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendimg', function (data) {
		var trgPlayer	=	data.trgPlayer;
		var srcPlayer	=	data.srcPlayer;
		var srcImg	=	data.srcImg;
		var trgsocketId = data.trgsocketId;
		var srcsocketId = data.srcsocketId;
		socket.broadcast.to(trgsocketId).emit('receiveimg',trgPlayer,data);
	});
	
	socket.on('startGame', function (data) {
		io.sockets.in(data.room).emit('gameStartAlert',data.room,data.msg);
	});
	
	socket.on('settimer', function (data) {
		console.log(data.srcPlayer+'--->'+data.trgPlayer);
		console.log(data.srcsocketid+'--->'+data.opponantsocketId);
		socket.emit('gettimer',data);
	});

	socket.on('gameStarted', function (data) { 
		socket.emit('sendImg',data.imgvalue);
		console.log("playerstarted-->"+data.playersocketid);
		console.log("game started with img-->"+data.imgvalue);
	});
	
	socket.on('sendInvitation',function(data) {
		console.log('sending invitation to->>'+data.receiver);
		socket.broadcast.to(data.receiver).emit('receiveInvitation',data);
	});
	
	socket.on('winner', function (data) {
		var currentroom='';
		var winningPlayer={};
		var winningPlayerarr={};
		var playerPlaying = data.playerPlaying;
		var currentroomlimit=data.roomlimit;
			for(var i=0;i<1;i++){
					currentroom = playerPlaying[i].room;
					data['room'] = currentroom;
					console.log('room : '+currentroom);
				}
		
		console.log('before updated length'+playerPlaying.length);
		playerPlaying = playerPlaying.filter(function(item){ 
					//console.log('winner player with filter-->>'+item);
					 return (item.PlayerSocketId !== socket.id); 
				});
		playerScorecard = playerScorecard.filter(function(item){ 
					//console.log('winner player with filter-->>'+item);
					 return (item.srcsocketId !== socket.id); 
				});	 
		 
		console.log('updated pending player-->'+playerPlaying.length);
				
		if(data.rank==1){
			data['score'] = '5000';
		}else if(data.rank==2){
			data['score'] = '3000';
		}else if(data.rank==3){
			data['score'] = '1500';
		}else if(data.rank==4){
			data['score'] = '1000';
		}else if(data.rank==5){
			data['score'] = '500';
		}
		
	
		  
		  con.query("INSERT INTO userpaircollection SET  usercollec_imgval="+data.imgval+",usercollec_img_count="+data.imgcnt+",usercollec_userrank="+data.rank+",usercollec_username='"+data.playername+"',usercollec_usersocketid='"+data.srcsocketId+"',usercollec_room='"+currentroom+"',usercollec_user_ipaddr='127.0.0.1' ", function (err, result) {
			if (err) throw err;
				console.log("1 record inserted");
			});

		
		playerScorecard.push(data);
		socket.broadcast.to(socket.room).emit('alertWinner',data,playerScorecard,playerPlaying,currentroom,currentroomlimit);
		socket.emit('disableplayer',playerPlaying);
		console.log('After updated length'+playerPlaying.length);
	});
	
	socket.on('gameover', function (playersocketid,pendingPlayers,currentroom,playerlimit) {
		var room = {};
		var imgvalue ='';
		var cntr=0;
		var playercnt = ''+playerlimit+'';
		console.log('after creting room-->' + playercnt);
		if(!cntr){
		

		  con.query("SELECT * FROM pairtype  WHERE ptype_player_count ="+playercnt+" order by rand() limit 1", function (err, row, fields) {
			if (err) throw err;
					imgvalue=row[0].ptype_set;
						
						room =  {'imgvalue':imgvalue,
								 'roomlimit': playercnt,
								 'roomname' : currentroom,
								 'roompassword' : 'na'
								}
						rooms = rooms.filter(function(item){ 
									return (item.roomname !== socket.room); 
								});		
						rooms.push(room);
						socket.broadcast.to(socket.room).emit('recreateroom', room);
						displayResult(playersocketid,currentroom);
						console.log("game is over:-->"+socket.room);
					
			
			});
		cntr++;
		}			 
	});
	
	
	function displayResult(playersocketid,currentroom){
	    console.log('displaying result....'+currentroom );
		con.query("SELECT usercollec_room,usercollec_usersocketid,usercollec_username,usercollec_imgval,sum(usercollec_img_count) as usercollec_img_count FROM userpaircollection  WHERE usercollec_room ='"+currentroom+"'  group by usercollec_usersocketid,usercollec_username,usercollec_imgval,usercollec_room ", function (err, row, fields) {
			if (err) throw err;
					console.log("Display Result : "+row.length);
					socket.broadcast.to(currentroom).emit('displayResult', row);
					
			});
	}
	
	socket.on('restartGame', function(newroom) {
        //var oldroom;
        //oldroom = socket.room;
        //socket.leave(socket.room);
        //socket.join(newroom.roomname);
		//console.log('joined room : ' + newroom.roomname);
		//console.log('joined room limit : ' + newroom.roomlimit);
        socket.room = newroom.roomname;
        socket.username = newroom.Playerusername;
		
		// add the client's username to the global list
		//usernames[username] = newroom.PlayerSocketId;
	
		  //Send this event to everyone in the room.
		io.sockets.in(socket.room).emit('connectToRoom', "You are in room no. "+newroom.roomname);
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has connected to this room');
		socket.broadcast.to(socket.room).emit('updateplayers', players, newroom);
		socket.broadcast.to(socket.room).emit('onlineplayers', onlineplayers);
		socket.emit('onlineplayers', onlineplayers);
		socket.emit('updateplayers', players, newroom);
		socket.emit('showgamearea');
	});
	
	
	socket.on('disconnect', function(){
	
		app.get('/', function (req, res) {
			res.sendfile(__dirname + '/index.html');
		});
		// remove the username from global usernames list
		 players = players.filter(function(item){ 
			 return (item.PlayerSocketId !== socket.id); 
		});
		
		onlineplayers = onlineplayers.filter(function(item){ 
			 return (item.PlayerSocketId !== socket.id); 
		});
		
		console.log('updated-players'+ players.length);
		// update list of users in chat, client-side
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER ', socket.username+' has left the game');
		socket.broadcast.to(socket.room).emit('updateplayers', players ,socket.room );
		
		// echo globally that this client has left
		//socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});
