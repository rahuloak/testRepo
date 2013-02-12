/**
 * APNS test client
 */
var net = require('net');

var HOST = '127.0.0.1';
var PORT = 7777;
var TOKEN_LENGTH = 64;
var NUM_PACKETS = 5;

var simpleFormat = false;

var tokenAlphabet = ['a', 'b', 'c', 'd', 'e', 'f',
					 '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
					 
var p = {"aps":{"alert":"This is an alert","badge":0,"sound":"chime"}};

var client = new net.Socket();
client.connect(PORT, HOST, function() {

    console.log('Connected to: ' + HOST + ':' + PORT);
    
    // Send a certain number of packets at a time
    for(var i=0;i<NUM_PACKETS;++i) {
    
	    var token = generateToken(TOKEN_LENGTH);
	    var payload = JSON.stringify(p);
	    var b = createBuffer(token, payload);
	    
	    client.write(b);
    }
    
    client.end();
});

// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
client.on('data', function(data) {
    console.log('Server replied with: ' + data);
    
    // Close the client socket completely
    client.destroy();
});

// Add a 'close' event handler for the client socket
client.on('close', function() {
    console.log('Connection closed');
});

var createBuffer = function(token, payload) {
	
	var len = 0;
	var command = 0;
	if( simpleFormat == true ) {
		len = 1 + 2 + token.length + 2 + payload.length;
	} else {
		len = 1 + 4 + 4 + 2 + token.length + 2 + payload.length;
		command = 1;
	}
	
	// Let's keep the tokens at 64 bytes since that's the token size Apple seems to be generating these days
	var buf = new Buffer(len); // Size of the data in simple format
	
	var offset = 0;
	// First byte is a command byte where 0 = simple format; 1 = enhanced format
	buf.writeUInt8(command, offset);
	offset++;
	
	if( simpleFormat != true ) {
		// 4 byte identifier - let's generate a random number between 1 and 100
		var id = Math.floor( Math.random() * 100 );
		buf.writeUInt32BE(id, offset);
		offset += 4;
		
		// 4 byte expiry - let's set this to 0 since we aren't sending a token anywhere
		var expiry = 0;
		buf.writeUInt32BE(expiry, offset);
		offset += 4;
	}
	
	// Then the size of the token (This always needs to be 32 bytes) 
	buf.writeUInt16BE(token.length, offset);
	offset += 2;
	
	// 64 byte generated token
	buf.write(token, offset);
	offset += token.length;;
	
	// Payload length
	buf.writeUInt16BE(payload.length, offset);
	offset += 2;
	
	// Actual payload
	buf.write(payload, offset);
	
	return buf;
}

var generateToken = function(length) {
	var token = "";
    for( var i=0;i<length;++i) {
    	var random = Math.floor(Math.random() * 100);
    	random = random % tokenAlphabet.length;
    	token += tokenAlphabet[ random ];
    }
    
    return token;
}
