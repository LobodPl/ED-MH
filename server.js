const io = require('socket.io')(8080);
console.dateLog = (data)=>{
var date = new Date();
console.log("["+String(date.getHours()<10 ? 0+String(date.getHours()) : date.getHours() )+":"+String(date.getMinutes()<10 ? 0+String(date.getMinutes()) : date.getMinutes() )+":"+String(date.getSeconds()<10 ? 0+String(date.getSeconds()) : date.getSeconds() )+"] "+ data)
}
var userConnected = [];
setInterval(() => {
    if(userConnected.length>0) console.dateLog("Connected users: " + userConnected);
}, 1000 * 60);
io.on("connect", (socket) => {
    var user = "";
    socket.emit("Auth", "");
    socket.on("Auth-r", (data, err) => {
        if (userConnected.indexOf(data) == -1) {
            console.dateLog("User connected: " + data);
            userConnected.push(data);
            user = data;
            socket.emit("Auth-succ", "");
            socket.broadcast.emit("Wing-Status", {
                "name": user,
                "status": "Online"
            })
            socket.on("check-wing", (data) => {
                console.dateLog(user+" requested wing check");
                data=JSON.parse(data);
                for (var i = 0; i < data.length; i++) {
                    console.log("Checking:"+data[i]+": "+ userConnected.indexOf(data[i]))
                    if (userConnected.indexOf(data[i]) >= 0){
                        socket.broadcast.emit("Wing-Status", {
                            "name": data[i],
                            "status": "Online"
                        });
                    }   
                }
            });
            socket.on('disconnect', function () {
                index = userConnected.indexOf(user);
                userConnected.splice(index, 1);
                socket.broadcast.emit("Wing-Status", {
                    "name": user,
                    "status": "Offline"
                })
                console.dateLog("Client disconnected: " + user);
            });
            socket.on("Wing-Mission-prop", (data) => {
                console.dateLog("/============[" + user + "]============\\");
                console.log(data);
                socket.broadcast.emit("Wing-Mission", data);
            });
        }else{
           setTimeout(() => {
            socket.emit("Auth", "");
           }, 5000); 
        }
    })
})