const io = require('socket.io')(8080);
  var userConnected = [];
  setInterval(()=>{
    console.log("Connected users: "+userConnected);
  },1000*60);
io.on("connect", (socket)=>{
    var user = "";
    console.log("Client connected");
    socket.emit("Auth","");
    socket.on("Auth-r",(data,err)=>{
        console.log("User Authorited as: "+data);
        userConnected.push(data);
        user = data;
        socket.emit("Auth-succ","");
        socket.broadcast.emit("Wing-Status",{"name":user,"status" : "Online"})
    })
    socket.on("check-wing",(data)=>{
        var wingOnline=[];
        for(var i = 0;i<data.length;i++){
            if(userConnected.indexOf(data[i])!=-1) socket.broadcast.emit("Wing-Status",{"name":data[i],"status" : "Online"});
        }
        socket.emit("Wing-Online",wingOnline)
    });
    socket.on('disconnect', function () { 
        index = userConnected.indexOf(user);
        userConnected.splice(index,1);
        socket.broadcast.emit("Wing-Status",{"name":user,"status" : "Offline"})
        console.log("Client disconnected: "+user);
    });
    socket.on("Wing-Mission-prop",(data)=>{
        console.log("/============["+user+"]============\\");
        console.log(data);
        socket.broadcast.emit("Wing-Mission",data);
    });
})

