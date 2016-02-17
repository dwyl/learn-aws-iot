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
=======
### What is AWS IoT?
AWS IoT provides two-way communication between devices that are connected to the internet and the AWS Cloud. This means that you can create applications that your users will be able to control from their phones or tablets. _(Very cool stuff!)_

AWS IoT consists of a few components. They are:

* Message broker - a mechanism for things to publish and receive messages from each other. The MQTT protocol can be used to publish and subscribe and the HTTP REST interface can be used to publish.

* Rules engine - allows the integration between IoT and other AWS services.
* Thing Registry - a.k.a. 'Device Registry'. This organises the resources associated with each _thing_.
* Thing Shadow service - provides persistent representations of your things in the AWS Cloud. It can hold state information about your _thing_ which can be synchronised when it next connects. Your _things_ can also publish their current state to a thing shadow for other applications or devices to use.
* Thing shadow - a.k.a. 'Device shadow'. It's a JSON document used to store and retrieve current state information for a _thing_.
* Device gateway - enables devices to communicate with AwS IoT.
* Security and identity service - Your _things_ must keep their credentials safe in order to send data securely to the message broker. The message broker and rules engine use AWS Security features to send data to devices or other AWS services.


### Get Started by Creating a **_THING_** with AWS IoT

To create a thing you'll need to use the AWS CLI. Install it by following the steps **[here](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-set-up.html)**.

You'll then need to go to your IAM console and create a user. Take down the Access Key ID and the Secret Access Key, you'll need them to configure your AWS CLI.

In the command line type the following command:

```$ aws configure```

You'll then be prompted to enter your Access Key ID, Secret Access Key and your region. Press enter for the fourth prompt. Your AWS CLI should now be ready to be used!

1. To create a _thing_ type the following into your terminal:

  ```$ aws iot create-thing --thing-name "theNameOfYourThing"```

  In order to see all of the things you have created, type ```$ aws iot list-things``` into the command line. It will then return an object with an array of your things in it:

  ```
  {
    "things": [
        {
            "attributes": {},
            "thingName": "thing1"
        },
        {
            "attributes": {},
            "thingName": "thing2"
        }
    ]
  }
  ```

2. To enable secure communication between a device and AWS IoT, you'll need to provision a certificate for your thing. You can create one yourself or you can have one created for you by AWS IoT. Type the following command into your command line to have a certificate provisioned for you:

  ```$ aws iot create-keys-and-certificate --set-as-active --certificate-pem-outfile cert.pem --public-key-outfile publicKey.pem --private-key-outfile privateKey.pem```

  This will automatically create your certificate and add the key files to your project. Make a note of the certificate ARN that it returns to your terminal.

3. Create and Attach an AWS IoT Policy to Your Certificate. To do so you'll need to create a new JSON file in your project. You can call it whatever you like, we've called it ```policy.json```. Include the following code in the newly created file:

  ```
  {
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Action":["iot:*"],
        "Resource": ["*"]
    }]
  }
  ```

  To create a policy you'll then need to type a create-policy command into your terminal. You'll need to name your policy here and copy the full file path to the policy file you just created:

  ```$ aws iot create-policy --policy-name "PolicyName" --policy-document file://path-to-your-policy-document```

  Now let's attach that policy to the certificate. Reference the certificate ARN you made a note of earlier. Use the folling command:

  ```$ aws iot attach-principal-policy --principal "certificate-arn" --policy-name "PolicyName"```

4. Attach your Certificate to your Device using the following command:

  ```$ aws iot attach-thing-principal --thing-name "theNameOfYourThing" --principal "certificate-arn"```

5. Verify MQTT Subscribe and Publish. You'll need to download the **_root certificate_** from [here](https://www.symantec.com/content/en/us/enterprise/verisign/roots/VeriSign-Class%203-Public-Primary-Certification-Authority-G5.pem) and then save it in a file called ```rootCA.pem```. Next download MQTT.fx from **[here](http://mqttfx.jfx4ee.org/index.php/download)**.

  Click on the link
  ![MQTT download](https://cloud.githubusercontent.com/assets/12450298/13011989/467f8938-d1a1-11e5-9308-efeb0294e793.png)

  Download the relevant files for your machine (eg windows or mac)
  ![machine spec](https://cloud.githubusercontent.com/assets/12450298/13012068/98e2be0c-d1a1-11e5-8b71-21eeb75ca95e.png)

  Type the following command to find out your AWS IoT endpoint. Make a note of it:
  ```$ aws iot describe-endpoint```

  Open the downloaded file to install MQTT and then launch it. Click on the gear at the top to configure the application. _(make sure egress to port 8883 is allowed on your network)_

  ![settings](https://cloud.githubusercontent.com/assets/12450298/13012350/e21f9ac6-d1a2-11e5-8a4a-29417e29ab95.png)

  Give it a profile name and then enter your Broker address which is the IoT endpoint. Then click on the SSL/TLS tab
  ![config](https://cloud.githubusercontent.com/assets/12450298/13012454/325b627c-d1a3-11e5-8ea4-eff11487ede5.png)

  Click on the 'Self signed certificates' radio button and then enter the following information:

  * CA File which is the path to your ```rootCA.pem``` file
  * Client Certificate File which is the path to your ```cert.pem``` file
  * Client Key File which is the path to your ```privateKey.pem``` file

  ![SSL/TLS](https://cloud.githubusercontent.com/assets/12450298/13012711/4393899c-d1a4-11e5-931c-aaf072f37bc7.png)

  Click 'OK' which will take you back to the MQTT.fx dashboard.

6. Click the connect button at the top of the window to connect to AWS IoT:

  ![connect](https://cloud.githubusercontent.com/assets/12450298/13012844/e8fd4c38-d1a4-11e5-8bfd-105445768591.png)


7. Subscribe to an MQTT topic by clicking on the subscribe tab, entering a topic name and then clicking subscribe (make sure the QoS 0 option is selected in the dropdown on the right):

  ![subscribe](https://cloud.githubusercontent.com/assets/12450298/13012947/576ee19a-d1a5-11e5-8f98-0ff25a229e31.png)

8. Publish to an MQTT topic by clicking on the publish tab and entering the name of the topic you just subscribed to:

  ![publish](https://cloud.githubusercontent.com/assets/12450298/13013055/b12be66a-d1a5-11e5-93e3-93523dcaa5a5.png)

  Then enter a message that you want to publish then hit publish. We posted 'hello world'. Go back to the subscribe tab to see your message:

  ![message sent](https://cloud.githubusercontent.com/assets/12450298/13013500/a61b4048-d1a7-11e5-883b-5ab4424e41bb.png)

That's it! You've set up your first Pub/Sub connection using AWS IoT!


### Create an IAM Role for AWS IoT
In order for IoT to interact with other AWS services, you need to create an IAM role so that it has the right permissions. Copy the following code into a file and call it trust-policy.json. _(make sure you enter an Sid, it can be anything you like)_:

```
{
"Version": "2012-10-17",  
"Statement": [{
      "Sid": "123456789example",
      "Effect": "Allow",
      "Principal": {
            "Service": "iot.amazonaws.com"
       },
      "Action": "sts:AssumeRole"
  }]
}
```

Then to create the IAM role, run the create-role command giving it the Assume Role policy document that you just created:

```$ aws iam create-role --role-name iot-actions-role --assume-role-policy-document file://path-to-file/trust-policy.json```

Make sure you save the ARN from the output of this command as you'll need it to create a _rule_ later on. _(rules enable you to access other AWS servives through IoT)

### Grant Permissions to the Role
Later on we're going to go through a couple of examples for using the AWS IoT service, one to post data to a DynamoDB table and then one to invoke a Lambda function. To do this we have to create a policy and then attach it to the role we created in the previous section. Copy the following code into a new file and name it whatever you like. We've called it ```iam-policy.json```:

```
{
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Action": [ "dynamodb:*", "lambda:InvokeFunction"],
        "Resource": ["*"]
    }]
}
```

Run the create-policy and link to the file path you just created:

```$ aws iam create-policy --policy-name iot-actions-policy --policy-document file://IAM-policy-document-file-path```

Make a note of the ARN that is returned in the command line and then run the attach-policy-role with this command:

```$ aws iam attach-role-policy --role-name iot-actions-role --policy-arn "policy-ARN"```

You should now be able to interact with DynamoDB and Lambda!

### Create a Rule to insert a Message into a DynamoDB table

1. Create a table in the DynamoDB console:

  ![create table](https://cloud.githubusercontent.com/assets/12450298/13015426/eca45280-d1b0-11e5-9e99-7ffe2e9127af.png)

  Make sure it has a partition key (hash key) and sort key (range key) of type 'string'. We've called ours 'key' and 'timestamp':

  ![keys](https://cloud.githubusercontent.com/assets/12450298/13015450/019e1518-d1b1-11e5-94c8-2e41eb92bcda.png)

  Select your provisioned capacity and then click 'Create table':

  ![provisioned capacity](https://cloud.githubusercontent.com/assets/12450298/13015473/2586f0b2-d1b1-11e5-9b82-eccb1a89f119.png)

  ![table overview](https://cloud.githubusercontent.com/assets/12450298/13015481/408941d0-d1b1-11e5-8d5f-10f81fdcb8ef.png)

2. Create a rule to trigger on a topic of your choice and insert an item into DynamoDB. Add the following to a file and call it ```dynamoDB-rule.json```. Copy the arn from the iot-actions-role we created earlier for the 'roleArn':

  ```
  {
  "sql": "SELECT * FROM 'topic/test'",
  "ruleDisabled": false,
  "actions": [{
      "dynamoDB": {
        "tableName": "Iot",
        "hashKeyField": "key",
        "hashKeyValue": "${topic(2)}",
        "rangeKeyField": "timestamp",
        "rangeKeyValue": "${timestamp()}",
        "roleArn": "arn:aws:iam::123456789012:role/iot-actions-role"
      }
    }]
  }
  ```

3. Create a topic rule using the create-topic-rule command with the path to the DynamoDB rule from the previous step:

  ```$ aws iot create-topic-rule --rule-name saveToDynamoDB --topic-rule-payload file://path-to-file/dynamoDB-rule.json```


4. Open up MQTT.fx and then publish a message to the topic you defined in the rule. Ours is 'topic/test'. Write the message in the form of an object as opposed to a string otherwise it will get converted into binary:

  ```
  {
    "msg" : "Hello, World"
  }
  ```

5. Go back to your DynamoDB console and then check the table you created. You should now see the entry you just published:

  ![published entry](https://cloud.githubusercontent.com/assets/12450298/13015516/7070c2c4-d1b1-11e5-910f-18526c0e56ee.png)

You should now be able to post items to a DynamoDB table using AWS IoT!


### Create a Rule to Invoke a Lambda Function

1. Go to the Lambda console and create a new function. It can be very basic as we're just testing that it's being invoked:

  Give it a name, choose your runtime and then write the function.
  ![function](https://cloud.githubusercontent.com/assets/12450298/13015801/00e5527e-d1b3-11e5-8536-c9d60c8f8fce.png)

  Leave the handler as ```index.handler``` and then give it a lambda_basic_execution role, then press 'Next' then 'Create function':
  ![role and handler](https://cloud.githubusercontent.com/assets/12450298/13015836/2e2e35b6-d1b3-11e5-8991-b4a86f53317e.png)
  **_(NOTE: when you select the role, just click 'Allow' on the page it takes you to)_**

  Make a note of the ARN on the review page for your function, you'll need that for the Rule.

2. Create a new file for your Lambda rule. We've called ours ```lambda-rule.json```. Enter the following code with your ARN:

  ```
  {
      "sql": "SELECT * FROM 'topic/test'",
      "ruleDisabled": false,
      "actions": [{
          "lambda": {
              "functionArn": "arn:aws:lambda:us-east-1:123456789012:function:myHelloWorld"
          }
      }]
  }
  ```

3. Create a topic rule by entering the create-topic-rule command from IoT. Name it what you like and then link it to the rule we just created:

  ```$ aws iot create-topic-rule --rule-name invokeLambda --topic-rule-payload file://path-to-file/lambda-rule.json```

4. Provide a resource based policy so that AWS IoT can invoke the Lambda function. Here is the command:

  ```$ aws lambda add-permission --function-name ("function_name") --region ("region") --principal iot.amazonaws.com --source-arn arn:aws:iot:us-east-1:(account_id):rule/(rule_name) --source-account ("account_id") --statement-id ("unique_id") --action "lambda:InvokeFunction"```

  The **_account id_** can be found in your AWS ['Security Credentials'](https://console.aws.amazon.com/iam/home?#security_credential) page. Click on '+ Account Identifiers' to view it. Note that you have to take the dashes out so you're left with the 12 digits.  
  The **_statement id_** is also known as 'Sid' which we defined earlier when we created an IAM role for IoT.

  ![security credentials](https://cloud.githubusercontent.com/assets/12450298/13016299/aa144e66-d1b5-11e5-97e8-9cd00a254745.png)

5. Go back to MQTT.fx and publish a message to your topic that you defined in the Lambda rule.

6. Go to the Lambda console and then click on your IoT function. Click on the monitoring tab and you should see that the function has been invoked through IoT.

  ![monitoring](https://cloud.githubusercontent.com/assets/12450298/13016336/02b1096a-d1b6-11e5-9879-d69f28bc7627.png)

That's it! Now you should be able to invoke a Lambda function through AWS IoT!


### Simulate a Device with Device Registry and Device Shadow 💡

1. The first thing you'll need to do is register the device by using the 'create-thing' command. We're going to simulate a light bulb, here is our example command:

  ```$ aws iot create-thing --thing-name lightBulb```

  It should return the name of your device with the ARN for that device:

  ```
  {
    "thingArn": "arn:aws:iot:eu-west-1:123456789:thing/lightBulb",
    "thingName": "lightBulb"
  }
  ```

2. Confirm that your device has been created with the following command:

  ```$ aws iot list-things```

  You should then see a list of your registered devices returned in the form of an object:

  ```
  {
    "things": [
        {
            "attributes": {},
            "thingName": "lightBulb"
        }
    ]
  }
  ```

3. To simulate our new device we're going to use MQTT.fx _(it can also be done with a RESTful API)_. MQTT will synchronize a thing with its shadow in AWS IoT. To report its state over MQTT the thing publishes on ```$aws/things/(thingName)/shadow/update```. If there's an error such as version conflict when merging the reported state AWS IoT will push an error message on topic ```$aws/things/(thingName)/shadow/rejected```. To receive updates from the shadow the thing should subscribe to topic ```$aws/things/(thingName)/shadow/update/accepted```.

  Subscribe to both the ```$aws/things/myLightBulb/shadow/update/rejected``` and ```$aws/things/myLightBulb/shadow/update/accepted``` topics:
  ![subscribe topics](https://cloud.githubusercontent.com/assets/12450298/13048106/8e99f1c2-d3db-11e5-9cea-9d1265638487.png)

  Publish the following message to ```$aws/things/(thingName)/shadow/update```:

  ```
  {
    "state": {
        "reported": {
            "color": "RED"
        }
    }
  }
  ```

  By doing so, this simulates reporting the state of the _thing_ to AWS IoT.

4. Next we're going to want to check if the state of our _thing_ has been updated. To do this we can enter the following command into our terminal:

  ```aws iot-data get-thing-shadow --thing-name "thingName" output.txt && cat output.txt```


  This should return an object like this one:

  ```
  {
    "state": {
      "reported": {
        "color":"RED"
        }
      },
    "metadata": {
      "reported": {
        "color": {
          "timestamp":123456789
          }
        }
      },
    "version": 1,
    "timestamp":123456789
  }
  ```
5. To request an update _(set state on the thing)_ we can use the 'update-thing-shadow' command. This is as follows:

  ```aws iot-data update-thing-shadow --thing-name "thingName" --payload "{ \"state\": {\"desired\": { \"color\": \"GREEN\" } } }"  output.txt && cat output.txt```

  It returns the following in your terminal:

  ```
  {
    "state": {
      "desired": {
        "color": "GREEN"
        }
      },
    "metadata": {
      "desired": {
        "color": {
          "timestamp":123456789
        }
      }
    },
  "version": 2,
  "timestamp":123456789
  }
  ```

6. Now if you run the first command ```aws iot-data get-thing-shadow --thing-name "thingName" output.txt && cat output.txt``` you should then get a return of:

  ```
  {
    "state": {  
      "desired": {
        "color": "GREEN"
        },
        "reported": {
          "color": "RED"
        },
        "delta": {
          "color":"GREEN"
          }
        },
        "metadata": {
          "desired": {
            "color": {
              "timestamp":123456789
              }
            },
            "reported": {
              "color": {
                "timestamp":123456789
                }
              }
            },
            "version":2,
            "timestamp":123456789
  }
  ```
  You can see the desired colour is green, the reported colour is red and the delta colour is green. This is basically saying that when the device is next connected, change the colour of the light bulb from red to green. Delta is showing the value by which the colour is changing. _(a copy of this is saved to your file tree structure in the specified ```output.txt``` file)_

7. Let's say we want to delete our _thing_ using MQTT.fx, all we have to to is publish a state of null to the ```$aws/things/(thingName)/shadow/update``` topic. It will look like this:

  ```
  {
    "state": null
  }
  ```

  To delete it using the CLI simply type the following command into your terminal:

  ```$ aws iot delete-thing --thing-name thingName```

  **_Note: You must detach any attached principals using the 'detach-thing-principal' CLI command before deleting a thing from the Thing Registry._**

  To detach a principal, type this command into your command line:

  ```$ aws iot detach-thing-principal --thing-name (thingName) --principal (principalYouWantToRemove)```


  ### Use IoT to Create a Websocket Connection in the Browser
  This is a complete tutorial that will help you to build a websocket application with AWS IoT from _scratch_.

  1. The first thing we're going to have to do is to create a _thing_ in AWS IoT. To do this we can run the 'create-thing' command in our terminal:

    ```$ aws iot create-thing --thing-name "thingName"```

    This will return an object with an ARN and your thing name.

  2. Next we'll need to create a couple of certificates for our device. Run this command in your command line:

    ```aws iot create-keys-and-certificate --set-as-active --certificate-pem-outfile cert.pem --public-key-outfile publicKey.pem --private-key-outfile privateKey.pem```

    This will create 3 certificate files in your project folder. Make a note of the certificate ARN that gets returned to your command line.

  3. Create and attach an AWS IoT policy to your certificate. Create a file called ```policy.json``` and save the following code in it:

    ```
    {
      "Version": "2012-10-17",
      "Statement": [{
          "Effect": "Allow",
          "Action":["iot:*"],
          "Resource": ["*"]
      }]
    }
    ```
    This is basically giving complete access to publish and subscribe on any resource. Next we have to create a policy document that links to the file we just created. To do so we run the following command:

    ```$ aws iot create-policy --policy-name "PubSubToAnyTopic" --policy-document file://path-to-your-policy-document```

    Now that we've created the policy, we have to attach it to our certificate. Use the following command with our certificate ARN to do so:

    ```$ aws iot attach-principal-policy --principal "(certificate-ARN-we-noted-down-earlier)" --policy-name "PubSubToAnyTopic"```

    Note: It shouldn't return anything to the command line.

  4. Now that we've got a certificate that we can use, let's attach it to our device. Use this command to attach it:

    ```$ aws iot attach-thing-principal --thing-name "thing-name" --principal "(certificate-ARN-we-noted-down-earlier)"```

    Again this shouldn't return anything to the command line.

  5. Now let's go to the IAM console because we'll need to create a _user_ with the correct permissions. Click on the users tab and then click on the 'Create New Users' button:

    ![new users](https://cloud.githubusercontent.com/assets/12450298/13117245/f7fdb704-d596-11e5-8e6c-9b7309623038.png)

    Give your new user a name and then click the box that says 'Generateand access key for each user'. Then click 'Create'.

    ![create user](https://cloud.githubusercontent.com/assets/12450298/13117299/39d000b0-d597-11e5-83ac-cb9639315343.png)

    Make a note of the Access Key ID and Secret Access Key because we'll need them to configure our websocket.

  6. While in the IAM console click on the 'Groups' tab on the left. We're going to create a new group and attach a policy to it that will give any user within that group access to AWS IoT. We'll then add our user to that group.   
  **(NOTE: MAKE SURE YOU ONLY GIVE THIS GROUP THE PERMISSION SPECIFIED AS THE SECRET KEYS WILL BE PUBLIC)**

    ![create group](https://cloud.githubusercontent.com/assets/12450298/13117471/fe24f254-d597-11e5-8839-8ac7fd387fbe.png)

    Give your group a name and then click 'Next Step'
    ![name group](https://cloud.githubusercontent.com/assets/12450298/13117555/5d74fa6a-d598-11e5-8b5a-9c5aa39f1cc1.png)

    Now select the 'AWSIoTDataAccess' policy and attach it
    ![policy](https://cloud.githubusercontent.com/assets/12450298/13118675/3e7b3b92-d59d-11e5-9238-d96d5d71f75c.png)

    Then click on the 'Users' tab and then select 'Add users'
    ![add users](https://cloud.githubusercontent.com/assets/12450298/13117634/b41925f8-d598-11e5-9a4c-57a94ba45ee6.png)

    Then click 'Add users'. You should then be able to see your user in the group
    ![user in group](https://cloud.githubusercontent.com/assets/12450298/13117693/ef600dfc-d598-11e5-8d19-0f2345915f26.png)

  7. We're going to have to get our AWS endpoint in order to configure the websocket. To do so type this command and then make note of the endpoint:

    ```$ aws iot describe-endpoint```

    **(NOTE: The endpoint MUST be in lowercase when you include it in your html file!!)**

  8. Now let's create our ```index.html``` file that we're going to be serving up. Enter the following code into ```index.html``` (Make sure you change the Access Keys to the ones associated with the user we created earlier when you're creating the endpoint):

    ```html
    <!DOCTYPE html>
    <html lang="EN">
    <head>
      <meta content="text/html;charset=utf-8" http-equiv="Content-Type">
      <meta content="utf-8" http-equiv="encoding">
    </head>
    <body>
      <ul id="chat">
        <li v-for="m in messages">{{ m }}</li>
      </ul>
      <input type="text" name="say" id="say" placeholder="Input a message here...">
      <button id="send">Send</button>

      <script src="https://cdnjs.cloudflare.com/ajax/libs/vue/1.0.16/vue.min.js" type="text/javascript"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.2/moment.min.js" type="text/javascript"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/components/core-min.js" type="text/javascript"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/components/hmac-min.js" type="text/javascript"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/components/sha256-min.js" type="text/javascript"></script>
      <script src="http://git.eclipse.org/c/paho/org.eclipse.paho.mqtt.javascript.git/plain/src/mqttws31.js" type="text/javascript"></script>
      <script type="text/javascript">

        var data = {
          messages: []
        };

        new Vue({
          el: '#chat',
          data: data
        });

        document.getElementById('send').addEventListener('click', function (e) {
          var say = document.getElementById('say')
          send(say.value);
          say.value = '';
        });

        function SigV4Utils(){}

        SigV4Utils.sign = function(key, msg) {
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

        function createEndpoint(regionName, awsIotEndpoint, accessKey, secretKey) {
          var time = moment.utc();
          var dateStamp = time.format('YYYYMMDD');
          var amzdate = dateStamp + 'T' + time.format('HHmmss') + 'Z';
          var service = 'iotdevicegateway';
          var region = regionName;
          var secretKey = secretKey;
          var accessKey = accessKey;
          var algorithm = 'AWS4-HMAC-SHA256';
          var method = 'GET';
          var canonicalUri = '/mqtt';
          var host = awsIotEndpoint;

          var credentialScope = dateStamp + '/' + region + '/' + service + '/' + 'aws4_request';
          var canonicalQuerystring = 'X-Amz-Algorithm=AWS4-HMAC-SHA256';
          canonicalQuerystring += '&X-Amz-Credential=' + encodeURIComponent(accessKey + '/' + credentialScope);
          canonicalQuerystring += '&X-Amz-Date=' + amzdate;
          canonicalQuerystring += '&X-Amz-SignedHeaders=host';

          var canonicalHeaders = 'host:' + host + '\n';
          var payloadHash = SigV4Utils.sha256('');
          var canonicalRequest = method + '\n' + canonicalUri + '\n' + canonicalQuerystring + '\n' + canonicalHeaders + '\nhost\n' + payloadHash;

          var stringToSign = algorithm + '\n' +  amzdate + '\n' +  credentialScope + '\n' +  SigV4Utils.sha256(canonicalRequest);
          var signingKey = SigV4Utils.getSignatureKey(secretKey, dateStamp, region, service);
          var signature = SigV4Utils.sign(signingKey, stringToSign);

          canonicalQuerystring += '&X-Amz-Signature=' + signature;
          return 'wss://' + host + canonicalUri + '?' + canonicalQuerystring;
        }

        var endpoint = createEndpoint(
            'eu-west-1',                                           // Your Region
            'lowercasea315z3lphjmasx.iot.eu-west-1.amazonaws.com', // Require 'lowercamelcase'!!
            'HKAEFLJBLKJHFAKJ',                                    // your Access Key ID
            '1234556664smblvmnbxvmbEXAMPLEQI5cTtu/aCbCi');         // Secret Access Key
        var clientId = Math.random().toString(36).substring(7);
        var client = new Paho.MQTT.Client(endpoint, clientId);
        var connectOptions = {
          useSSL: true,
          timeout: 3,
          mqttVersion: 4,
          onSuccess: subscribe
        };
        client.connect(connectOptions);
        client.onMessageArrived = onMessage;
        client.onConnectionLost = function(e) { console.log(e) };

        function subscribe() {
          client.subscribe("Test/chat");
          console.log("subscribed");
        }

        function send(content) {
          var message = new Paho.MQTT.Message(content);
          message.destinationName = "Test/chat";
          client.send(message);
          console.log("sent");
        }

        function onMessage(message) {
          data.messages.push(message.payloadString);
          console.log("message received: " + message.payloadString);
        }
      </script>
    </body>
    </html>
    ```

  9. Let's take our code for a spin! Type the following command into the terminal to start up a simple server:

    ```$ python -m SimpleHTTPServer```

    Then open two windows side by side at http://localhost:8000/

    Type something in the left and then press send:

    ![send](https://cloud.githubusercontent.com/assets/12450298/13118451/18333d00-d59c-11e5-9fb0-f75507c6094c.png)

    The message should appear instantaneously in both windows:

    ![sent](https://cloud.githubusercontent.com/assets/12450298/13118502/59639694-d59c-11e5-8b20-2bfaf1a17f7f.png)

    Do the same from the other window:

    ![reply](https://cloud.githubusercontent.com/assets/12450298/13118527/76a46a58-d59c-11e5-932b-7e2fa69ebef3.png)

    And you should see the same thing happen:

    ![replied](https://cloud.githubusercontent.com/assets/12450298/13118538/89e06e78-d59c-11e5-9e8a-f83e4b4f0ccf.png)


  That's it! You should now be able to open up a websocket connection in the browser using AWS IoT!

  Credit to Yusuke Arai for the **[tutorial](http://dev.classmethod.jp/cloud/aws/aws-iot-mqtt-over-websocket/)**
