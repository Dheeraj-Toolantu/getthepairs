	var socket = io.connect();
	var playerPlaying=[];
	var playerScorecard=[];
	var playername = '';
	var imgvalue = '';
	var playerslimit='';
	var currentroom='';
	var imgCollection=['1','2','3'];
	var k=0;
	var rank=1;
	var countdownarr=[];
	
	socket.on('connect', function(){
	});

	// listener, whenever the server emits 'updatechat', this updates the chat body
	socket.on('updatechat', function (username, data) {
		$('#conversation').append('<b>'+username + ':</b> ' + data + '<br>');
	});
	
	socket.on('onlineplayers', function(onlineplayers) {
		$('#onlineplayers').html('');
		var i=0;
		$.each(onlineplayers, function(key, value) {
				if(value.PlayerSocketId!=socket.id){
					$('#onlineplayers').append('<div class="media" style="padding:5px"><div class="media-left"><a href="javascript:void(0)"><img class="media-object" src="/profile.png" alt="profile picture" height="60px" ></a></div><div class="media-body"><h4><strong>'+value.player+'</strong></h4><b>&nbsp;<button class="btn btn-xs btn-primary" onclick="invitePlayer(\''+value.PlayerSocketId+'\')">Invite</button></b></div></div>');
				}
			});	
		
		})	
	
	// listener, whenever the server emits 'updaterooms', this updates the room the client is in
	socket.on('updateplayers', function(usernames,roomdetails) {
	    currentroom=roomdetails.roomname;
		$('#players').html('');
		$('#restartGame').html('');
		$('#targetOutcome').html('');
		var i=0;
		rank=1;
		$.each(usernames, function(key, value) {
			if(value.room==currentroom){
				if(value.PlayerSocketId!=socket.id){
				    playerPlaying.push(value);
					$('#players').append('<div class="swiper-slide col-lg-3 col-md-3 col-xs-3 col-sm-3"><div class="col-md-12"><div class="media"><div class="media-left"><img src="/profile.png" class="media-object" style="width:60px"></div><div class="media-body"><h4 class="media-heading">' + value.player + '</h4><p>India</p></div></div></div><div class="col-md-12"><div  id="'+value.PlayerSocketId+'" data-opponant="'+value.player+'" data-opponant-socketId="'+value.PlayerSocketId+'"><div class="'+value.PlayerSocketId+' div1" style="width:185px;height:255px;margin-top:5px;"></div></div></div></div>');
					
					$( "#"+value.PlayerSocketId ).droppable({
						  drop: function( event, ui ) {
						  
						   var target = $(event.target);
						   var source = $(ui.draggable);
						   var opponant = target.attr('data-opponant');
						   var opponantsocketId = target.attr('data-opponant-socketId');
						   var imgval=source.attr("data-val");
						   var imgscore=source.attr("data-score");
						   
						   target.find("."+value.PlayerSocketId).removeClass('borderGreen');				
						   target.find("."+value.PlayerSocketId).addClass('borderRed');				
						   $("."+value.PlayerSocketId).html('Please Wait...');
						   source.draggable("disable", 1);
						   target.droppable("disable", 1);
						   requestTo(opponant,opponantsocketId,imgval,imgscore,roomdetails.roomlimit);
						   source.draggable('destroy');
						   source.hide(800,function(){
								$(this).remove();
						   }); 
						  
						  setTimeout(
								  function() 
								  {
									getpairs(roomdetails.roomlimit);
								  }, 1000);
						  }
						});
					  
				}
				$('#count').text(i);
				i++;
			}
		});
		
			if(i>=roomdetails.roomlimit){
			$("#currentuser").html("");
			$("#playerneeded").html("");
			$('#targetOutcome').html('<div class="alert alert-success" style="font-size:16px">Please collect the <span class="badge" style="font-size:18px">'+roomdetails.roomlimit+' same pairs</span> of image to win the Game</div>');
			k=0;
				//	$('#startAlert').html(data);
					socket.emit('gameStarted',{
							roomname:roomdetails.roomname,
							imgvalue:roomdetails.imgvalue,
							imgscore:roomdetails.imgscore,
							playersocketid:socket.id
					});
					
						setTimeout(
							  function() 
							  {
								//$("#CountDownTimer").TimeCircles({ time: { Days: { show: false }, Hours: { show: false } }});
								$("#CountDownTimer").TimeCircles({
									time: { Days: { show: false }, Hours: { show: false } }
									}).addListener(function(unit,value,total) {
										if(total == 0){
											$("#CountDownTimer").TimeCircles().stop();
											socket.emit('displayFinalResult',{
											 roomname:roomdetails.roomname,
											 playersocketid:socket.id
											});
										}
								});
							  }, 500);
							  
						/*var countdown =  1  * 60 * 1000;
						var timerId = setInterval(function(){
						  countdown -= 1000;
					 	  var min = Math.floor(countdown / (60 * 1000));
						  //var sec = Math.floor(countdown - (min * 60 * 1000));  // wrong
						  var sec = Math.floor((countdown - (min * 60 * 1000)) / 1000);  //correct

						  if (countdown <= 0) {
							 $("#CountDownTimer").TimeCircles().stop();
							 socket.emit('displayFinalResult',{
								 roomname:roomdetails.roomname,
								 playersocketid:socket.id
								});
							 clearInterval(timerId);
							 //doSomething();
						  } else {
							 $("#countTime").html(min + " : " + sec);
						  }

						}, 1000); //1000ms. = 1sec.	 */ 
							  
				}else{
					
					if((roomdetails.roomlimit - i)>1){
						//$('#playerneeded').html(+' more players needed to start the game');
						$('#targetOutcome').html('<div class="alert alert-danger" style="font-size:16px"><span class="badge" style="font-size:18px">'+(roomdetails.roomlimit - i)+'</span> more players needed to start the game</div>');
					}else if((roomdetails.roomlimit - i)==1){
						//$('#playerneeded').html('Only '+(roomdetails.roomlimit - i)+' player needed to start the game');
						$('#targetOutcome').html('<div class="alert alert-warning" style="font-size:16px">Only <span class="badge" style="font-size:18px">'+(roomdetails.roomlimit - i)+'</span> more player needed to start the game</div>');
					}else if(($("#count").text())<3){
						$('#targetOutcome').html('<div class="alert alert-danger" style="font-size:16px">It seems that only 2 players are in the Game</div>');
						
					}
				}
			} );
			
	socket.on('receiveimg', function (username,data) {
	var dragid = new Date().valueOf();
	$('#currentuser').append('<div id="recievedrag-'+dragid+'" data-val="'+data.srcImg+'" data-score="'+data.imgscore+'" class="col-xs-3 col-sm-3 col-md-2 col-lg-2 draggable"><a href="javascript:void(0)" id="'+data.srcImg+'"class="thumbnail text-center" style="width:180px;height:250px"><img  src="/'+data.srcImg+'.jpg"  img-val="'+data.srcImg+'" width="180" height="250"><span class="badge">Score: '+data.imgscore+'</span></a></div>');
					$('#recievedrag-'+dragid).draggable({
					  revert: 'invalid',
					  cursor:'move'
					})
	setTimeout(
			  function() 
			  {
				getpairs(data.roomlimit);
				$("#"+data.srcsocketId).droppable( "option", "disabled", false );		
				
				$("."+data.srcsocketId).addClass('borderGreen');				
				$("."+data.srcsocketId).removeClass('borderRed');
				$("."+data.srcsocketId).html('');
			     
				socket.emit('settimer',{
				    srcPlayer : data.srcPlayer,
					trgPlayer : data.trgPlayer,
					opponantsocketId:data.trgsocketId,
					roomlimit:data.roomlimit,
					imgvalue:data.srcImg,
					imgscore:data.imgscore,
					srcsocketid:data.srcsocketId
				});
				
			  }, 500);
			  
		//$('#'+data.srcPlayer).html('<img src="swap.jpg" data-val="03" draggable="true" ondragstart="drag(event)" width="69" height="69">');
		/*$.each(data, function(key, value) {
			
			if(value.trgsocketId==socket.id){
				$('#currentuser').after('<img src="/'+value.imgval+'.jpg" data-val="'+value.imgval+'" draggable="true" ondragstart="drag(event)" width="69" height="69">');
				$('#'+value.srcsocketId).html('<img src="swap.jpg" data-val="03" draggable="true" ondragstart="drag(event)" width="69" height="69">');
			//	ischeck 
			}else if(value.srcsocketId==socket.id){
				//$('#currentuser').after('<img src="/'+value.imgval+'.jpg" data-val="'+value.imgval+'" draggable="true" ondragstart="drag(event)" width="69" height="69">');
			}
		});*/
	});
	
	socket.on('alertWinner', function (data,playerScorecard,pendingPlayers,currentroom,currentroomlimit) {
	rank=rank+1;
	var srctag='';
	var playercount = $("#count").text();
	var playerimgcount = data.imgcnt;
	    if(data.rank==1){
		    for(i=1;i<=playerimgcount;i++){
				srctag=srctag+"<img src='"+data.imgval+".jpg' height=40>";
			}
			$("."+data.srcsocketId).html("<div class='alert alert-success' role='alert'><span class='glyphicon glyphicon-king' aria-hidden='true'></span>&nbsp;"+data.playername+" is the <span class='badge'>"+data.rank+"st</span> winner who made following pairs<br>"+srctag+"<br><br><span class='badge'>Earn : "+data.score+" Coins</span></div>");
		}else if(data.rank==2){
			for(i=1;i<=playerimgcount;i++){
			   srctag=srctag+"<img src='"+data.imgval+".jpg' height=40>";
			}
			$("."+data.srcsocketId).html("<div class='alert alert-success' role='alert'><span class='glyphicon glyphicon-king' aria-hidden='true'></span>&nbsp;"+data.playername+" is the <span class='badge'>"+data.rank+"nd</span> winner who made following pairs<br>"+srctag+"<br><br><span class='badge'>Earn : "+data.score+" Coins</span></div>");
		}else if(data.rank==3){
			for(i=1;i<=playerimgcount;i++){
			   srctag=srctag+"<img src='"+data.imgval+".jpg' height=40>";
			}
			$("."+data.srcsocketId).html("<div class='alert alert-success' role='alert'><span class='glyphicon glyphicon-king' aria-hidden='true'></span>&nbsp;"+data.playername+" is the <span class='badge'>"+data.rank+"rd</span> winner who made follwoing pairs<br>"+srctag+"<br><br><span class='badge'>Earn : "+data.score+" Coins</span></div>");
		}else{
			for(i=1;i<=playerimgcount;i++){
			   srctag=srctag+"<img src='"+data.imgval+".jpg' height=40>";
			}
			$("."+data.srcsocketId).html("<div class='alert alert-success' role='alert'><span class='glyphicon glyphicon-king' aria-hidden='true'></span>&nbsp;"+data.playername+" is the <span class='badge'>"+data.rank+"th</span> winner who made follwoing pairs<br>"+srctag+"<br><br><span class='badge'>Earn : "+data.score+" Coins</span></div>");
		}
	   //playerPlaying = pendingPlayers;
			$.each(countdownarr, function(countkey, countval) {
				if(countval.playersocketid==data.srcsocketId){
					if(countval.countdownval){
						countval.countdownval.stop();
						$("."+data.srcsocketId).find("#countdown").remove();
						countdownarr = countdownarr.filter(function(item){ 
							 return (item.playersocketid !== data.srcsocketId); 
						});		
					}									
				}
			});	
				
		if(currentroomlimit==playerimgcount){
			playercount = parseInt(playercount) + 1;
			socket.emit('gameover',data.srcsocketId,pendingPlayers,currentroom,playercount);
		}
	
		$("#"+data.srcsocketId).droppable("disable", 1);
		$("."+data.srcsocketId).removeClass('borderGreen');
		$("."+data.srcsocketId).addClass('borderRed');
		
	});
	
	
	socket.on('disableplayer', function (pendingPlayers){
		
		$.each(pendingPlayers, function(key, value) {
			
			if(value.PlayerSocketId!=socket.id){
				$("#"+value.PlayerSocketId).droppable("disable", 1);
				$("."+value.PlayerSocketId).removeClass('borderGreen');
				$("."+value.PlayerSocketId).addClass('borderRed');
				
				$.each(countdownarr, function(countkey, countval) {
					if(countval.playersocketid==value.PlayerSocketId){
						if(countval.countdownval){
							countval.countdownval.stop();
							$("."+value.PlayerSocketId).find("#countdown").remove();
							countdownarr = countdownarr.filter(function(item){ 
								 return (item.playersocketid !== value.PlayerSocketId); 
							});		
						}									
					}
				});	
			}
		});
		
	});
	
	socket.on('displayResult', function (data) {
	    $("#displayResult").html('');
		$("#menuToggler").show(500);
		for(var l=0;l < data.length;l++){
			$("#displayResult").append('<div class="media"><div class="media-left"><a href="javascript:void(0)"><img class="media-object" src="/'+data[l].usercollec_imgval+'.jpg" alt="profile picture" height="80px" ></a></div><div class="media-body"><h4 class="media-heading"><strong>'+data[l].usercollec_username+'</strong></h4><b>&nbsp;<span class="badge">Pairs : '+data[l].usercollec_img_count+'</span>&nbsp;<span class="badge">Score : '+data[l].userscore+'</span></b></div></div>'); 
		}
		
		// playerusername, usercollec_imgval, usercollec_img_count
		/*
		$.each(playerScorecard, function(key, value) {
		    if(value.room==currentroom){
				
				$("#displayResult").append('<div class="media"><div class="media-left"><a href="javascript:void(0)"><img class="media-object" src="/profile.png" alt="profile picture" height="80px" ></a></div><div class="media-body"><h4 class="media-heading"><strong>'+value.playername+'</strong></h4><b>&nbsp;<span class="badge">Rank : '+value.rank+'</span>&nbsp;<span class="badge">Coins : '+value.score+'</span></b></div></div>');
				
				$("#menuToggler").show(500);
			}
		});
		*/
		
	});
	
	socket.on('writeFinalResult', function (data) {
	    $("#writeFinalResult").html('');
	    $(".swiper-container").hide(500);
		$("#getAllpairs").hide(500);
		$("#menuToggler").hide(500);
		$("#restartGame").hide(500);
		
		var str3='';
		var str4='';
		for(var l=0;l < data.length;l++){
		    str3='';
			str4='';
			var str1 = data[l].usercollec_imgval;
			var imgval = new Array();
			imgval = str1.split(",");
			
			var str2 = data[l].usercollec_img_count;
			var imgcnt = new Array();
			imgcnt = str2.split(",");
			
			var str5= data[l].userscore;
			var imgscore = new Array();
			imgscore = str5.split(",");
			
			str3 = '<div class="col-md-4"><div class="panel panel-default"><div class="panel-heading"><h4>'+data[l].usercollec_username+'</h4> &nbsp;<span class="badge">Total Coins: '+data[l].usertotalscore+'</span></div><div class="panel-body"><ul class="list-group">';
			
			for(var m=0;m<imgval.length;m++){
				str4 = str4 + '<li class="list-group-item"><div class="media"><div class="media-left"><a href="javascript:void(0)"><img class="media-object" src="/'+imgval[m]+'.jpg" alt="profile picture" height="40px" ></a></div><div class="media-body"><b>&nbsp;<span class="badge">Pairs : '+imgcnt[m]+'</span>&nbsp;<span class="badge">Coins : '+imgscore[m]+'</span></b></div></div></li>';
			}
			str3 = str3+str4+'<ul></div></div></div>';
			
			$("#writeFinalResult").append(str3);
		}
		/*$.each(playerScorecard, function(key, value) {
		    if(value.room==currentroom){
				
				$("#writeFinalResult").append('<div class="media"><div class="media-left"><a href="javascript:void(0)"><img class="media-object" src="/profile.png" alt="profile picture" height="80px" ></a></div><div class="media-body"><h4 class="media-heading"><strong>'+value.playername+'</strong></h4><b>&nbsp;<span class="badge">Rank : '+value.rank+'</span>&nbsp;<span class="badge">Coins : '+value.score+'</span></b></div></div>');
				
				$("#menuToggler").show(500);
			}
		});*/
	});
	
	
	socket.on('recreateroom',function(room){
		var str = room.imgvalue;
		var imgvalue = new Array();
		imgvalue = str.split(",");
		console.log('Client Imgvalue '+imgvalue);
		
		var str1 = room.imgscore;
		var imgscore = new Array();
		imgscore = str1.split(",");
		console.log('Client Imgscore '+imgscore);
		
		var roompass='';
		if(room.roompassword){
		 roompass=room.roompassword;
		}else{ 
		 roompass='na';
		}
		 $('#restartGame').html('<span><a href="javascript:void(0)" class="btn btn-sm btn-primary" onclick="restartGame(\''+room.roomname+'\',\''+room.roomlimit+'\',\''+roompass+'\',\''+imgvalue+'\',\''+imgscore+'\')">Restart The Game</a></span>').delay( 2000 ).fadeIn( 400 );
	
	});
	
	socket.on('updaterooms', function (room) {
		var str = room.imgvalue;
		var imgvalue = new Array();
		imgvalue = str.split(",");
		console.log('Client Imgvalue: '+imgvalue);
		
		var str1 = room.imgscore;
		var imgscore = new Array();
		imgscore = str1.split(",");
		console.log('Client Imgscore: '+imgscore);
		
		var roompass='';
		if(room.roompassword){
		 roompass=room.roompassword;
		}else{
		 roompass='na';
		}
		 $('#rooms').append('<li class="list-group-item"><span class="badge">Player Limit : '+room.roomlimit+'</span><b>'+room.roomname+'</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:void(0)" class="btn btn-sm btn-primary" onclick="switchRoom(\''+room.roomname+'\',\''+room.roomlimit+'\',\''+roompass+'\',\''+imgvalue+'\',\''+imgscore+'\')">click here to join</a></li>');
	});

	function switchRoom(name,playerslimit,pass,imgvalue,imgscore){
		socket.emit('switchRoom', {
		roomname:name,
		roomlimit:playerslimit,
		roompassword:pass,
		imgvalue : imgvalue,
		imgscore : imgscore,
		Playerusername : playername, 
		PlayerSocketId : socket.id
		});
	}
	
	function restartGame(name,playerslimit,pass,imgvalue,imgscore){
		socket.emit('restartGame', {
		roomname:name,
		roomlimit:playerslimit,
		roompassword:pass,
		imgvalue : imgvalue,
		imgscore : imgscore,
		Playerusername : playername, 
		PlayerSocketId : socket.id
		});
	}
	
	function joinRoom(roomname){
		socket.emit('joinRoom', {
			roomname:roomname,
			Playerusername : playername, 
			PlayerSocketId : socket.id
		});
	}
	
	function invitePlayer(receiver){
		socket.emit('sendInvitation', {
			receiver:receiver,
			roomname:currentroom,
			sender : socket.id,
			sendername : playername
		});
	}
	
	socket.on('showgamearea', function () {
		$("#gamearea").removeClass('hidepannel');
		$("#homearea").addClass('hidepannel');
	});
	
	socket.on('receiveInvitation', function (data) {
	    var password='na';
		$('#invitations').append('<li class="list-group-item"><b>'+data.sendername+' has invited to join '+ data.roomname+'</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:void(0)" class="btn btn-sm btn-primary" onclick="joinRoom(\''+data.roomname+'\')">click here to join</a></li>');
	});

	socket.on('sendImg', function (data) {
		$('#currentuser').html('');
		$("#menuToggler").hide(500);
		closeNav();
		
		var str = data.imgvalue;
		var str1 = data.imgscore;
		console.log('Client Imgvalue ->'+str);
		console.log('Client Imgscore ->'+str1);
		var imgvalue = new Array();
		var imgscore = new Array();
		imgvalue = str.split(",");
		imgscore = str1.split(",");
		console.log('Client Imgvalue'+imgvalue);
		
		//var imgvalue=['1','2','3','4','2','4','4','3','2','1','2','4','1','3','3','2'];
		// on connection to server, ask for user's name with an anonymous callback	
		for(var i=0;i<imgvalue.length;i++){
			$('#currentuser').append('<div id="drag-'+imgvalue[i]+'" data-val="'+imgvalue[i]+'" data-score="'+imgscore[i]+'" class="col-xs-3 col-sm-3 col-md-2 col-lg-2 draggable"><a href="javascript:void(0)" class="thumbnail text-center" style="width:180px;height:250px"><img  src="/'+imgvalue[i]+'.jpg" img-val="'+imgvalue[i]+'" width="180" height="250"><span class="badge">Score: '+imgscore[i]+'</span></a></div>');
			$('#drag-'+imgvalue[i]).draggable({
				  revert: 'invalid',
				  cursor:'move'
				})
		}
	});
	
	// on load of page
	$(function(){
		// when the client clicks SEND
		$('#datasend').click( function() {
			var message = $('#data').val();
			$('#data').val('');
			// tell server to execute 'sendchat' and send along one parameter
			socket.emit('sendchat', message);
		});

		// when the client hits ENTER on their keyboard
		$('#data').keypress(function(e) {
			if(e.which == 13) {
				$(this).blur();
				$('#datasend').focus().click();
			}
		});
		
		// creating rooms
		$('#roombutton').click(function(){
			var name = $('#roomname').val();
			var roomlimit = $('#roomlimit').val();
			var roompassword = '';
			if(name!="" && roomlimit!=""){
			$(this).closest('.input-group').hide(500);
			$('#roomname').val('');
			socket.emit('create',{
				roomname:name,
				roomlimit:roomlimit,
				roompassword: roompassword
			}
			)
			}else{
			 alert('Please enter the ROOM NAME and select the PLAYER LIMIT !!!');
			}
		});
	});
	
	function requestToanother(opponant,opponantsocketId,imgval,imgscore,roomlimit){
	    
		socket.emit('sendimg', {
			trgPlayer:opponant,
			srcPlayer:playername,
			srcImg:imgval,
			imgscore:imgscore,
			trgsocketId:opponantsocketId,
			roomlimit:roomlimit,
			srcsocketId:socket.id
		});
	}
	
	function requestTo(opponant,opponantsocketId,imgval,imgscore,roomlimit){
	    
		socket.emit('sendimg', {
			trgPlayer:opponant,
			srcPlayer:playername,
			srcImg:imgval,
			imgscore:imgscore,
			trgsocketId:opponantsocketId,
			roomlimit:roomlimit,
			srcsocketId:socket.id
		});
		
		$.each(countdownarr, function(countkey, countval) {
					if(countval.playersocketid==opponantsocketId){
						if(countval.countdownval){
							countval.countdownval.stop();
							$("."+opponantsocketId).find("#countdown").remove();
							countdownarr = countdownarr.filter(function(item){ 
								 return (item.playersocketid !== opponantsocketId); 
							});		
						}									
					}
				});		
	}
	
	socket.on('gettimer',function(data){
	    var match = 0;
		var matchval=0;
		var newval = 0;	
		var oldval = 0;
		var targetattr = data.srcsocketid;
		var arraysOfIds = $('#getAllpairs img').map(function(){
                       return $(this).attr('img-val');
                   }).get();
	    //alert(arraysOfIds.length+" - "+data.roomlimit+" - "+targetattr);
		if(arraysOfIds.length > data.roomlimit){
				$("."+targetattr).html('<div id="countdown"></div>');
			    
			countdown = $("."+targetattr).find("#countdown").countdown360({
				radius: 25,
				seconds:8,
				label: ['sec', 'secs'],
				fontColor: '#FFFFFF',
				autostart: false,
				onComplete: function () {
					requestTo(data.srcPlayer,targetattr,data.imgvalue,data.imgscore,data.roomlimit);
				    $("#"+data.imgvalue).parent('.draggable').remove();
					console.log('done');
				}
				});
				countdown.start();
				var countval = {
								playersocketid:targetattr,
								countdownval:countdown
								}
				countdownarr.push(countval);
			
			
			/*for(var i=0;i<arraysOfIds.length;i++){					
					 newval=arraysOfIds[i];
					
					if(i==0){
						oldval = newval;
					}else{
						if(oldval == newval){
							match=1;
							imgcnt=imgcnt+1;
							matchval=oldval;
					}
				}				
			} 	*/

				/*
				if(data.tm != 0){
				   countdown.start();	
				 }else{
					
					$("#"+targetattr).find('#countdown').remove();
					countdown.stop();
				 }*/
		}
	});

	
	
	$(document).ready(function(){
	
    $("#start").on('click',function(e){
        
        playername=$("#username").val();
        $('.singleuser').html(playername);
		//pass=$("#password").val();
        if(playername){
            socket.emit('adduser',{
				Playerusername : playername, 
				PlayerSocketId : socket.id
			});
			$("#homearea").removeClass('hidepannel');
			$("#wrapper").addClass('hidepannel');
		}else{
		  alert("Please give a suitable name in Username field");
		}
		e.preventDefault();
    });
	
});
