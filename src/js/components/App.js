import React, { Component } from 'react';
import mqtt from 'mqtt';
import AWS  from 'aws-sdk';
import { formatRequestUrl, initClient } from '../utils/request.js';

class App extends Component {

  componentDidMount() {
    AWS.config.region = 'eu-west-1';

    var credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'eu-west-1:21512274-1564-449c-b56e-d29fa128917a',
    });

    module.exports = function getUrl() {
        credentials.get(function(err) {
          if(err) {
              console.log(err);
              return;
          }
          var options = {
            regionName: 'eu-west-1',
            secretKey:  credentials.secretAccessKey,
            accessKey:  credentials.accessKeyId,
            endpoint:   ,
            sessionToken: credentials.sessionToken
          };

          var requestUrl = formatRequestUrl(options);

          initClient(requestUrl);
      });
    }
  }

  render () {
    return (
      <div>
        <p>HELLO</p>
      </div>
    )
  }
}

export default App;
