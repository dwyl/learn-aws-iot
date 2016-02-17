/**
 * utilities to do sigv4 from http://docs.aws.amazon.com/general/latest/gr/sigv4-add-signature-to-request.html#sigv4-add-signature-querystring
 */

var moment = require('moment');
var CryptoJS = require('crypto-js');
function SigV4Utils(){};

SigV4Utils.sign = function(key, msg){
  var hash = CryptoJS.HmacSHA256(msg, key);
  return hash.toString(CryptoJS.enc.Hex);
};

SigV4Utils.sha256 = function(msg) {
  var hash = CryptoJS.SHA256(msg);
  return hash.toString(CryptoJS.enc.Hex);
};

SigV4Utils.getSignatureKey = function(key, dateStamp, regionName, serviceName) {
  var kDate = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + key);
  var kRegion = CryptoJS.HmacSHA256(regionName, kDate);
  var kService = CryptoJS.HmacSHA256(serviceName, kRegion);
  var kSigning = CryptoJS.HmacSHA256('aws4_request', kService);
  return kSigning;
};

function formatRequestUrl(options) {
    var time = moment.utc();
    var dateStamp = time.format('YYYYMMDD');
    var amzdate = dateStamp + 'T' + time.format('HHmmss') + 'Z';
    var service = 'iotdevicegateway';
    var region = options.regionName;
    var secretKey = options.secretKey;
    var accessKey = options.accessKey;
    var algorithm = 'AWS4-HMAC-SHA256';
    var method = 'GET';
    var canonicalUri = '/mqtt';
    var host = options.endpoint;

    var credentialScope = dateStamp + '/' + region + '/' + service + '/' + 'aws4_request';
    var canonicalQuerystring = 'X-Amz-Algorithm=AWS4-HMAC-SHA256';
    canonicalQuerystring += '&X-Amz-Credential=' + encodeURIComponent(accessKey + '/' + credentialScope);
    canonicalQuerystring += '&X-Amz-Date=' + amzdate;
    canonicalQuerystring += '&X-Amz-SignedHeaders=host';

    var canonicalHeaders = 'host:' + host + '\n';
    var payloadHash = SigV4Utils.sha256('');
    var canonicalRequest = method + '\n' + canonicalUri + '\n' + canonicalQuerystring + '\n' + canonicalHeaders + '\nhost\n' + payloadHash;
        console.log('canonicalRequest ' + canonicalRequest);

    var stringToSign = algorithm + '\n' +  amzdate + '\n' +  credentialScope + '\n' +  SigV4Utils.sha256(canonicalRequest);
    var signingKey = SigV4Utils.getSignatureKey(secretKey, dateStamp, region, service);
    var signature = SigV4Utils.sign(signingKey, stringToSign);

    canonicalQuerystring += '&X-Amz-Signature=' + signature;
    var sessionToken = options.sessionToken ? "&X-Amz-Security-Token=" + options.sessionToken : "";

    return 'wss://' + host + canonicalUri + '?' + canonicalQuerystring + sessionToken;
}

/**

Function to initiate the websocket connection using the Paho MQTT client

**/

function initClient(requestUrl) {
  var clientId = String(Math.random()).replace('.', '');
  var client = new Paho.MQTT.Client(requestUrl, clientId);
  var connectOptions = {
      onSuccess: function () {
          console.log('connected');

          // subscribe to the drawing
          client.subscribe("blog/drawing/iot-demo");

          // publish a lifecycle event
          message = new Paho.MQTT.Message('{"id":"' + credentials.identityId + '"}');
          message.destinationName = 'blog/drawing/usage';
          console.log(message);
          client.send(message);
      },
      useSSL: true,
      timeout: 3,
      mqttVersion: 4,
      onFailure: function () {
          console.error('connect failed');
      }
  };
  client.connect(connectOptions);

  client.onMessageArrived = function (message) {

      try {
          console.log("msg arrived: " +  message.payloadString);
          draw(JSON.parse(message.payloadString));
      } catch (e) {
          console.log("error! " + e);
      }

  };
}

/**

Function to create a HTTP GET request

**/

function ajaxGetRequest(url, callback){
  var httpRequest = new XMLHttpRequest();
  httpRequest.open("GET", url, true);
  httpRequest.onreadystatechange = function(){
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        callback(httpRequest.responseText);
      } else {
        console.log('There was a problem with the request.');
      }
    }
  };
  httpRequest.send(null);
};

module.exports = {
  formatRequestUrl,
  initClient,
  ajaxGetRequest
};
