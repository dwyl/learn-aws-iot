# learn-aws-iot

Learn how to use Amazon Web Services Internet of Things (IoT) service to build connected applications.

## AWS IOT MQTT over Web Sockets

We want to enable browser based apps to send and receive data from iOT connected devices using WebSockets.

AWS iOT acts as a message broker - essentially a pub/sub broker service that enables sending and receiving messages to and from AWS IoT.
MQTT is lightweight connectivity protocol for pub/sub message transport. It can be used over the Web Socket Protocol to send messages between a client and server. AWS introduced support for MQTT over WebSockets for AWS iOT in [January 2016](https://aws.amazon.com/about-aws/whats-new/2016/01/aws-iot-now-supports-websockets-custom-keepalive-intervals-and-enhanced-console/)!

The `./index.html` file has an example of of mqtt/websockets/html/js subscription and publishing of topics/messages in chrome console.

### WebSocket Protocol in a Web Application

We want to enable browser based apps to send and receive data from iOT connected devices.

The process is as follows:

1. Initiate a WebSocket connection on a client

  According to the docs, this is done by sending a http GET request with a url that is signed with AWS credentials.

  AWS requires AWS credentials to be specified in a particular format ([signature Version 4](http://docs.aws.amazon.com/general/latest/gr/sigv4-add-signature-to-request.html#sigv4-add-signature-querystring)) in the url query string. The docs provide several utility functions for constructing a request url. These have been used to create the `formatRequestUrl` function in the file `src/js/utils/request/js`.

  This function takes an options object and returns the signed requestUrl. Options object shape:
  ```js
  {
    var options = {
      regionName: ,
      secretKey:  ,
      accessKey:  ,
      endpoint:   , // get this from the `aws iot describe-endpoint` cli command
      sessionToken: ,
    };
  }
  ```

2. Open the WebSocket connect to AWS iOT

  Once the web socket connection has been initiated, an MQTT client needs to be created to receive MQTT messages over the Web Socket Protocol.

  The docs recommend using the Paho MQTT client. This can be included as a script in the index.html file or the mqtt npm module could be used.

  An example of using the Paho client has been included in the `src/js/components/request.js` file in the `initClient` function.

  Based on the AWS IOT [Docs](http://docs.aws.amazon.com/iot/latest/developerguide/protocols.html);

## WebSockets with Amazon Cognito to securely authenticate end-users to your apps and devices.  

Instead of specifying the Access Key and Secret Access key credentials to initiate the web socket connection, you could use AWS Cognito to provide the AWS credentials for both authenticated and unauthenticated users. Suggested by this [example](http://draw.kyleroche.com/main.js).

This has been implemented in `src/js/components/App.js`;

## Try it out

Run the example by typing `npm run dev:start` in your terminal after cloning this repo and navigate to `localhost:8080/dev/` in your browser

## TODO:

* FIX Webpack bundling error ('require' is not defined)!!
* Try fixing the HTTP request error for the GET request to initiate the Web Socket connection: `XMLHttpRequest cannot load <my endpoint> Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, https, chrome-extension-resource.`
* Try implementing this example: https://github.com/awslabs/aws-iot-examples

## READING:

* http://stackoverflow.com/questions/35345481/aws-iot-mqtt-over-websocket-protocol
