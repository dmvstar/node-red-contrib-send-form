# node-red-contrib-send-form
This is a node-red node for posting http(s) requests containing files as multipart formData. Currently a work in progress.
As of now this node is only looking for files. However, there are future plans to handle all multipart/form-data.

## Installation
run npm -g install node-red-contrib-send-form

## Features
Pulled together using some of the best of parts of other node-red-contrib nodes (particularly node-red-contrib-http-request), and the best parts of stackoverflow.
Currently only sends files. However, there are future plans to handle other types multipart/form-data.

## Usage
Required inputs: 
url (this is specified on the node) 
filedata base64 or binary buffer
- Pass the buffer into the node as part of the msg, as "msg.payload.fileData"
Source type
Can be selected within the node from a dropdown menu "type" or passed in "msg.payload.fileType". Payload overrides the dropdown menu
Currently accepts  
- Base64
- Binary
Form Fields as part of payload, well be added to form via formData.append(<name>, <value>);
- msg.payload.formOptions.chat_id = '213123123213';
- msg.payload.formOptions.caption = 'photo_'+stamp;


## Why this module?
As of May 2018, NodeRed does not yet support sending multipart form-data.  This module aims to begin to close that gap.

There is always room for improvement, and new ideas are valued.  Feel free to submit pull requests to make this library even better.

## What's next?
In the future, I definitely want to add more support for other data types, as well as more flexibility in the model.  For example, I'd for users to be able to just pass in a file instead of read it from local.  I developed this node for a very specific use case, which is why I haven't dived into all that yet.  It's on my to-do list!
