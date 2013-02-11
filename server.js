/**
 * Mock APNS server
 */
 var net = require('net');
 
 var HOST='127.0.0.1';
 var PORT=7777;
 
 var options = {allowHalfOpen:true};
 
 net.createServer(options, function(sock) {
 
 	var allData = [];
 
 	sock.on('data', function(data) {

 		// Keep pushing data on to a temp array
 		allData.push(data);
 	});
 	
 	sock.on('end', function() {
 		console.log('END received. Size of array:' + allData.length);
 		
 		try {
	 		// Read buffers of data, one at a time
	 		for( var i in allData ) {
	 			readBuffer(allData[i]);
	 		}
	 		
	 		sock.write('0');
 		} catch(e) {
 			sock.write('1');
 		}

 		sock.end();
 	});
 	
 	sock.on('close', function(data) {
 		console.log('CLOSED connection');
 	});
 
 }).listen(PORT, HOST);
 
 console.log('Server listening on ' + HOST + ':' + PORT);
 
 var readBuffer = function(data) {

 	var offset = 0;
 	
 	// Format 
 	var command = data.readUInt8(offset);
 	offset++;
 	
 	// Handle enhanced mode
 	if( command == 1 ) {
 		var id = data.readUInt32BE(offset);
 		offset += 4;
 		
 		var expiry = data.readUInt32BE(offset);
 		offset += 4;
 	}
 	
 	var tokenLength = data.readUInt16BE(offset);
 	offset += 2;
 	
 	var tempBuf = new Buffer(tokenLength);
 	data.copy(tempBuf, 0, offset, offset+tokenLength);
 	var token = tempBuf.toString();
 	offset += tokenLength;
 	
 	var payloadLength = data.readUInt16BE(offset);
 	offset += 2;
 	
 	var pBuf = new Buffer(payloadLength);
 	data.copy(pBuf, 0, offset, offset+payloadLength);
 	var payload = pBuf.toString();
 }