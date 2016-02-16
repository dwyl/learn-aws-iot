import React, { Component } from 'react';
const mqtt = require('mqtt');
const ajaxGetRequest = require('../utils/request.js');

class App extends Component {

  componentDidMount() {
    ajaxGetRequest(function(data){
      console.log("DATA", data);
    });

    const client = mqtt.connect('', {
      useSSL: true,
      timeout: 3,
      mqttVersion: 4,
    });

    client.subscribe("my/topic");

    client.on("message", function(topic, payload) {
      alert([topic, payload].join(": "));
      client.end();
    });
    client.on("error", function(error) {
      console.log("error", error);
      client.end();
    });
    client.on("connect", function(connect){
      console.log("connect", connect);
    })
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
