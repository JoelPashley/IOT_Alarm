var FS = require('fs');
var http = require('http').createServer(handler);
var url = require('url');
var io = require('socket.io')(http);

http.listen(80);

//This function creates the http server and will pass only ever serve the http file GUI.html.
function handler(req, res){
    var query = url.parse(req.url, true);
    var filename = query.pathname;
    if(filename == "/GUI/main.css"){
        FS.readFile('GUI/main.css', function(err, data){
            res.writeHead(200, {'Content-Type':'text/css'});
            res.write(data);
            res.end();
        });
    }else if(filename == "GUI/pinpad.js"){
        FS.readFile('GUI/pinpad.js', function(err, data){
            res.writeHead(200, {'Content-Type':'text/javascript'});
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
}

io.sockets.on('connection', function(socket){
    var passcode = "1234";
    socket.on('passcode', function(data){
        if(data == passcode){
            socket.emit('passwordRes', true);
        }else{
            socket.emit('passwordRes', false);
        }
    })
})

console.log("Server started...")