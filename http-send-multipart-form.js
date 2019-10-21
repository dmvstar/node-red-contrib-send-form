// require in libs
var mustache = require('mustache'),
request = require('request'),
formData = require('form-data-buffer'),
fs = require('fs');
const fileType = require('file-type');
// require in libs

var filepath = "default.csv"; // initializing filepath

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

			// Look for filepath - // TODO improve logic

			if(msg.payload.form_options !== undefined) {
				for (x in msg.payload.form_options) {
					console.log(x + "->" + msg.payload.form_options[x]);
				}
			}

			if (!n.filepath && !msg.filepath) {
				// throw an error if no filepath
				node.warn(RED._("Error: no filepath found to send file."));
				msg.error = "Filepath was not defined";
				msg.statusCode = 400;
				node.send(msg); // TODO: make sure this escapes entirely; need better error-handling here
			} else {
				if (n.filepath) {
					filepath = n.filepath;
				} else if (msg.filepath) { // TODO: improve logic
					filepath = msg.filepath;
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
				var buffer, filename = 'default', filemime = 'unknown';
				
				if(msg.payload.file_name !== undefined) {
					filename = msg.payload.file_name;
				}	
				
				if(msg.payload.photo !== undefined) {
					buffer = Buffer.from(n.filepath, 'base64');
				} else {
					buffer = Buffer.from(msg.payload.photo, 'base64');
				}
				
				var fileTypeInfo = fileType(buffer);
				filetype = fileTypeInfo.mime;
				filename += fileTypeInfo.ext;

console.log("httpSendMultipart 1");
console.log(fileType(buffer));
console.log("httpSendMultipart 1");

console.log("httpSendMultipart 2");
console.log(url);
console.log("httpSendMultipart 2");

				
				if(msg.payload.form_options !== undefined) {
					for (x in msg.payload.form_options) {
						console.log(x + "->" + msg.payload.form_options[x]);
						formData.append(x, msg.payload.form_options[x]);
					}
				} else {
					formData.append('chat_id', '457840189');
					formData.append('caption', 'photo251');
				}
				
				formData.append('photo', buffer, {
					'contentType': filetype, //'image/png',
					'filename': filemime //'nb-3x256.png'
				});

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
