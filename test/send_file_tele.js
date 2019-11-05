var fs = require('fs');
var request = require('request');


var FormData = require('form-data');
const fileType = require('file-type');


var formData = new FormData();

//-------------------------------------------------------------
var chat_id = '<CHAT_ID>';
var bot_id = 'bot<BOT_ID>';
var url = 'https://api.telegram.org/'+bot_id+'/sendPhoto';
//-------------------------------------------------------------


var buffer = fs.readFileSync('nb-3x256.png');
var buffer64  = buffer.toString('base64');
var bufferBin = Buffer.from(buffer64, 'base64');
//console.log( 'buffer64 ['+buffer64.length+']: '+	buffer64 );
console.log( 'buffer64 ['+buffer64.length+']');
console.log( 'bufferBin ['+bufferBin.length+']');
                                                 
fs.open('nb-3x256-2.png', 'w', (err, fd) => {
  if (err) throw err;
  fs.appendFile(fd, buffer, (err) => {
    fs.close(fd, (err) => {
      if (err) throw err;
    });
    if (err) throw err;
  });
});

var Readable = require('stream').Readable; 

function bufferToStream(binary) {

    const readableInstanceStream = new Readable( 
    {        
       //start: 0,
       //end: binary.length-1,
       read() {
        this.push(binary);
        this.push(null);
//console.log( 'length: '+	this.length );
      }
    }
    );
    return readableInstanceStream;
}

console.log(fileType(buffer));

var streamFile = bufferToStream(buffer);

streamFile.on('data', (chunk) => {
  console.log(`Received ${chunk.length} bytes of data.`);
});

streamFile.on('end', () => {
  console.log('There will be no more data.');
});


formData.append('chat_id', chat_id);
formData.append('caption', 'photo251');
formData.append('photo',    buffer, {'contentType': 'image/png', 'filename': 'nb-3x256.png', 'knownLength': buffer.length});

//console.log( formData );

formData.submit(url, function(err, res) { // StarBot
	if (err) {
		return console.error('upload failed:', err);
	}
	res.resume(); 	
	//console.log( res );
});

