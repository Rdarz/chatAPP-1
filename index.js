var express = require('express');
var app=require('express')();
var http=require('http').Server(app);
var io=require('socket.io')(http);;
var path = require('path');
var body=require('body-parser');
var users=[];
var sockets=[];
var nickname;




app.use(express.static(path.join(__dirname, '/')));


app.use(express.static(path.join(__dirname, '/chatapp')));
app.use(body.urlencoded({extended:true}));
app.use(body.json());
app.use('/public', express.static(__dirname + '/public'));
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');


app.get('/',function(req,res){
	res.render('nickname');
});

app.post('/chatapp',function(req,res,next){
	console.log("\r\rnickname\r\r",req.body.nickname);

	console.log(users);
	var flag=1;
	for(var i=0;i<users.length;i++){
		if(users[i]==req.body.nickname){
			flag=0;	
			res.render('nickname'); //redirect to nickname page on refresh

		}

	}
	
	if(flag==1){
		
		nickname=req.body.nickname;
		res.render('index',{nickname:req.body.nickname,user:users});
		users.push(req.body.nickname);
		
	}else{
		console.log("Already Exist");
	}


});
app.get('/chatapp',function(req,res){
	res.render('index',{nickname:req.body.nickname});
	nicknames=req.body.nickname;
})
// app.post('/chatapp',function(req,res){
// 	var user=req.body.nickname;
	
// 	res.sendFile(__dirname + '/public/index.html');
// 	 // res.send(user);
// });
io.sockets.on('connection', function(socket){
		socket.on('init', function(nicknames){
			console.log('connection established');
			users[nicknames]=socket.id;
			console.log(users);
			//sockets[socket.id]={username: nicknames, socket: socket};
		});
		socket.on('private message', function(to, message){
			sockets[users[to]].emit(
					'message',{
						message:message,
						from: sockets[socket.id].nicknames
					}
				);
		});
});


io.on('connection',function(socket){

	console.log('a user connected');
	socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  	});

	socket.on('user connected', function(nickname){
    socket.broadcast.emit('user connected', nickname);
    console.log('user list');
	});

	socket.on('disconnect', function(nickname) {
		console.log(nickname);
		console.log("Disconnected");
		//Array.prototype.remove = function(v) { this.splice(this.indexOf(v) == -1 ? this.length : this.indexOf(v), 1); }
		//users.remove(nickname);

		//console.log(users);
		/* Act on the event */
	});

	socket.on('connect',function(){
		console.log('List of Users');
	});



	socket.on('wchat message', function(msg,to,from){
		

		io.to(users[to]).emit('wchat message',msg,to,from);
		
	    console.log('message: ' + msg+'to' +to);
	  });

	socket.on('logout', function(nickname) {
		console.log( users[nickname]);
		delete users[nickname];
		var index=users.indexOf(nickname);
		users.splice(index,1);
		console.log("Delete success.");

		console.log(users);
		/* Act on the event */
	});

});

http.listen(3000,function(){
	console.log('listening on :3000');
})





