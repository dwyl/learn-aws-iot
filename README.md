# learn-aws-iot
Learn how to use Amazon Web Services Internet of Things (IoT) service to build connected applications.

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


### Simulate a Device with Device Registry and Device Shadow

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
