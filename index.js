var FS = require('fs');
var http = require('http').createServer(handler);
var url = require('url');
var io = require('socket.io')(http);
var favicon = require('serve-favicon');
var GPIO = require('onoff').Gpio;
var BUZZER = new GPIO(1, 'out');
var PIR = require('pir').use(new GPIO(7, 'in'));

http.listen(80);

var ARMED = false;
var ACTIVE = false;
//var ACTIVE_START = ""+new Date().getHours()+":"+new Date().getMinutes();

var _favicon = favicon("GUI/favicon.ico");

//This function creates the http server and will pass only ever serve the http file GUI.html.
function handler(req, res){
    _favicon(req, res, function(){
        var query = url.parse(req.url, true);
        var filename = query.pathname;
        if(filename == "/GUI/main.css"){
            FS.readFile('GUI/main.css', function(err, data){
                res.writeHead(200, {'Content-Type':'text/css'});
                res.write(data);
                res.end();
            });
        }else if(filename == "/GUI/pinpad.js"){
            FS.readFile('GUI/pinpad.js', function(err, data){
                res.writeHead(200, {'Content-Type':'text/javascript'});
                res.write(data);
                res.end();
            });
        }else if(filename == "/GUI/alarmicon.png"){
            FS.readFile('GUI/alarmicon.png', function(err, data){
                res.writeHead(200, {'Content-Type':'image'});
                res.write(data);
                res.end();
            });
        }else{
            FS.readFile('GUI/GUI.html', function(err, data){
                res.writeHead(200, {'Content-Type':'text/html'});
                res.write(data);
                res.end();
            });
        }
    });
}

io.sockets.on('connection', function(socket){
    var passcode = "1234";
    if(ACTIVE){
        socket.emit("connected", "Triggered");
    }else{
        socket.emit("connected", ARMED);
    }
    socket.on('passcode', function(data){
        if(data == passcode){
            socket.emit('passwordRes', true);
        }else{
            socket.emit('passwordRes', false);
        }
    });
    socket.on('armed', function(data){
        if(data == passcode){
            //IMPLEMENT: ARM ALARM ACTIVATE PIR AND ALARM
            ARMED = true;
            io.sockets.emit('armedRes', true);
        }else{
            socket.emit('passwordRes', false);
        }
    });
    socket.on('disarmed', function(data){
        if(data == passcode){
            //IMPLEMENT: ARM ALARM DEACTIVATE PIR AND ALARM
            BUZZER.write(0);
            ARMED = false;
            io.sockets.emit('disarmedRes', true);
        }else{
            socket.emit('passwordRes', false);
        }
    });
});

function TriggerAlarm(time){
    BUZZER.write(1);
    io.sockets.emit('triggered', time);
}

PIR.on('ready', PIR => {
    console.log("PIR - Active");
    PIR.on('movement', time => {
        if(ARMED){
            TriggerAlarm(time);
        }
    });
});

process.on('SIGINT', function(){
    //IMPLEMENT: DEACTIVATE AND UNEXPORT ALL GPIO
    BUZZER.unexport();
    console.log("Unloaded... Exiting...")
    process.exit();
})

console.log("Server started...")