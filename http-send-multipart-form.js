// require in libs
var mustache = require('mustache'),
request = require('request'),
formData = require('form-data-buffer'),
fs = require('fs');
const fileType = require('file-type');
// require in libs

var fileData = ""; // initializing file

module.exports = function (RED) {

	function httpSendMultipart(n) {
		// Setup node
		RED.nodes.createNode(this, n);
		var node = this;
		var nodeUrl = n.url;
		
        var isTemplatedUrl = (nodeUrl || "").indexOf("{{") != -1;
		
		var isTemplatedUrl = (nodeUrl || "").indexOf("{{") != -1;

		this.ret = n.ret || "txt"; // default return type is text
		if (RED.settings.httpRequestTimeout) {
			this.reqTimeout = parseInt(RED.settings.httpRequestTimeout) || 60000;
		} else {
			this.reqTimeout = 60000;
		}

		// 1) Process inputs to Node
		this.on("input", function (msg) {
			// TODO: add ability to select other input types (not just files)
			
			if(msg.payload.formOptions !== undefined) {
				for (x in msg.payload.formOptions) {
					console.log(x + "->" + msg.payload.formOptions[x]);
				}
			}

			if (!msg.payload.fileData) {
				// throw an error if no file
				node.warn(RED._("Error: no file found to send."));
				msg.error = "File was not defined";
				msg.statusCode = 400;
				node.send(msg); // TODO: make sure this escapes entirely; need better error-handling here
			} else {
				fileData = msg.payload.fileData;
			}
				node.status({
					fill: "blue",
					shape: "dot",
					text: "Sending multipart request..."
				});
				var url = nodeUrl; // TODO add ability to take this from the settings.js config file
				
				if (isTemplatedUrl) {
					url = mustache.render(nodeUrl, msg);
				}
				
				if (!url) {
					node.error(RED._("httpSendMultipart.errors.no-url"), msg);
					node.status({
						fill: "red",
						shape: "ring",
						text: (RED._("httpSendMultipart.errors.no-url"))
					});
					return;
				}

				// Add auth if it exists
				if (this.credentials && this.credentials.user) {
					var urlTail = url.substring(url.indexOf('://') + 3); // hacky but it works. don't judge me
					var username = this.credentials.user,
					password = this.credentials.password;
					url = 'https://' + username + ':' + password + '@' + urlTail;
				}

				var FormData = require('form-data-buffer');

				var formData = new FormData();
				var buffer, fileName = 'default', fileMime = 'unknown', fileDataType;
				
				if(msg.payload.fileName !== undefined) {
					fileName = msg.payload.fileName;
				}	
				
				fileDataType = n.filetype;
				if(msg.payload.fileDataType !== undefined) {
					fileDataType = msg.payload.fileDataType;
				} 
console.log("fileDataType: "+fileDataType);
				if (fileDataType !== 'base64' && fileDataType !== 'binary'){
					node.error(RED._("node-red-contrib-send-form .errors.no-file-data-type") + " ["+fileDataType+"]", msg); //   
					node.status({
						fill: "red",
						shape: "ring",
						text: (RED._("node-red-contrib-send-form .errors.no-file-data-type") + " ["+fileDataType+"]")
					});
					return;
				}	
				
console.log("msg.payload.fileData " +msg.payload.fileData.length);
			
				if(msg.payload.fileData !== undefined) {
				{
					if (fileDataType === 'base64')
						buffer = Buffer.from(msg.payload.fileData, 'base64');
					else
						buffer = msg.payload.fileData;
				}
				
				var fileTypeInfo = fileType(buffer);
				fileMime = fileTypeInfo.mime;
				fileName += "."+fileTypeInfo.ext;

console.log(fileType(buffer));
console.log(url);


				if(msg.payload.formOptions !== undefined) {
					for (x in msg.payload.formOptions) {
						console.log(x + "->" + msg.payload.formOptions[x]);
						formData.append(x, msg.payload.formOptions[x]);
					}
				} else {
					formData.append('chat_id', '457840189');
					formData.append('caption', 'photo251');
				}

				var formFileField = msg.payload.formFileField;
console.log(formFileField + " "+msg.payload.fileData.length+" "+buffer.length);
console.log('contentType '+ fileMime + ' filename '+ fileName);


				formData.append(formFileField, buffer, { 	// 'photo'
					'contentType': fileMime, 				//'image/png',
					'filename': fileName 					//'nb-3x256.png'
				});


//formData.append('chat_id', '457840189');
//formData.append('caption', 'photo251');
//formData.append('photo',    buffer, {'contentType': 'image/png', 'filename': 'nb-3x256.png'});
				
				
//				formData.submit('https://api.telegram.org/bot960067796:AAEA_yYDSp5zPwIu1zxCvb5UR2yakGqkEsY/sendPhoto',
				formData.submit(url,
					function (err, res) { // StarBot

					if (err || !res) {
						// node.error(RED._("httpSendMultipart.errors.no-url"), msg);
						var statusText = "Unexpected error";
						if (err) {
							statusText = err;
						} else if (!resp) {
							statusText = "No response object";
						}
						node.status({
							fill: "red",
							shape: "ring",
							text: statusText
						});
					} else {
						res.resume();
						msg.payload = res;
						node.send(msg);
console.log("msg.statusCode "+msg.payload.statusCode);

						if(msg.payload.statusCode !== 200){
console.log("msg.statusCode "+msg.payload.statusCode);
							node.status({
								fill: "red",
								shape: "ring",
								//text: "node-red-contrib-send-form .errors.status " + msg.payload.statusCode
								text: (RED._("node-red-contrib-send-form.errors.error-status-code") + " ["+msg.payload.statusCode+"]")
							});
						} else {
console.log("msg.statusCode "+msg.payload.statusCode);
							node.status({
							});
						}
					}
				});
			} //else
		}); // end of on.input
	} // end of httpSendMultipart fxn

	// Register the Node
	RED.nodes.registerType("http-send-multipart-form", httpSendMultipart, {
		credentials: {
			user: {
				type: "text"
			},
			password: {
				type: "password"
			}
		}
	});

}; // end module.exports
