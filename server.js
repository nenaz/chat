var WebSocketServer = require('websocket').server;
var http = require('http');
 
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(5000, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});
 
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production 
    // applications, as it defeats all standard cross-origin protection 
    // facilities built into the protocol and the browser.  You should 
    // *always* verify the connection's origin and decide whether or not 
    // to accept it. 
    autoAcceptConnections: false
});
 
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed. 
  return true;
}

var peers = [];
var data;

wsServer.on('connection', function(ws) {
    console.log('33333333');
    // peers.push(ws);
});
 
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin 
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    // console.dir(request);
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.key = request.key;
    peers.push(connection);
    // console.log(peers.length);
    connection.on('message', function(message) {
        // if (message.type === 'utf8') {
        //     console.log('Received Message: ' + message.utf8Data);
        //     connection.sendUTF(peers.length);
        // }
        // else if (message.type === 'binary') {
        //     console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        //     connection.sendBytes(message.binaryData);
        // }
        data = JSON.parse(message.utf8Data);
        // console.log('message.utf8Data.type = '+message.utf8Data.type);
        switch (data.type) {
            case 'auth':
                // connection.uid = 
                peers[peers.length - 1].uid = data.uid;
                peers[peers.length - 1].userName = data.userName;
                console.log(peers[peers.length - 1].uid);
                console.log(peers[peers.length - 1].userName);
                console.log(data.userName);
                break;
            default:
                sendAll(data.uid, data.message);
        }
        console.log(message);
        console.log(peers.length);
        // connection.sendUTF('2323423423423');
        
    });
    connection.on('close', function(reasonCode, description) {
        console.log(connection.key);
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

function sendAll(uid, message) {
    // for (var i=0; i < peers.length; i++) {
    //     console.log('peers[i].uid = '+peers[i].uid);
    //     console.log('uid = '+uid);
    //     if (peers[i].uid !== uid && peers[i].userName === 'Support') {
    //         var obj = {
    //             message: message,
    //             uid: data.uid,
    //             userName: data.userName
    //         };
    //         // console.log(JSON.stringify(obj));
    //         peers[i].send(JSON.stringify(obj));
    //     }
    // }

    for (var i = 0; i < peers.length; i += 1) {
        // if (peers[i].name.indexOf('Support') !== -1) {
        if (peers[i].userName === 'Support' && peers[i].uid !== uid) {
            var obj = {
                message: message,
                uid: data.uid,
                fromUID: '',
                to: '',
                userName: data.userName
            };
            peers[i].send(JSON.stringify(obj));
        } 
        // else if (peers[i].userName !== 'Support' && peers[i].uid === uid) {
        //     var obj = {
        //         message: message,
        //         uid: data.uid,
        //         userName: data.userName
        //     };
        //     peers[i].send(JSON.stringify(obj));
        // }
    }
}